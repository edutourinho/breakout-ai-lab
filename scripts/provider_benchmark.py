"""Run an isolated, bounded OpenCode comparison. Never print/store API credentials."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import time
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
MODEL = {"groq": "groq/openai/gpt-oss-120b", "opencode": "opencode/big-pickle"}
ALLOWED = {"src/paddle.js", "tests/paddle.test.js"}


def environment():
    keys = ("PATH", "LANG", "HTTP_PROXY", "HTTPS_PROXY", "NO_PROXY", "http_proxy", "https_proxy", "no_proxy", "SSL_CERT_FILE")
    return {key: os.environ[key] for key in keys if key in os.environ}


def verify_groq(key):
    """Check exact model availability; errors are codes only, never HTTP bodies."""
    request = urllib.request.Request("https://api.groq.com/openai/v1/models", headers={"Authorization": "Bearer " + key})
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            data = json.load(response)
            ids = {item.get("id") for item in data.get("data", [])}
            return "available" if "openai/gpt-oss-120b" in ids else "model_unavailable"
    except urllib.error.HTTPError as error:
        return "http_" + str(error.code)
    except (OSError, ValueError):
        return "connection_error"


def summarize_events(raw):
    result = {"steps": 0, "input_tokens": 0, "output_tokens": 0, "catalog_cost_estimate_usd": 0, "error_events": 0}
    for line in raw.splitlines():
        try:
            event = json.loads(line)
        except ValueError:
            continue
        if event.get("type") == "error":
            result["error_events"] += 1
        if event.get("type") == "step_finish":
            part = event.get("part", {})
            tokens = part.get("tokens", {})
            result["steps"] += 1
            result["input_tokens"] += tokens.get("input", 0)
            result["output_tokens"] += tokens.get("output", 0)
            result["catalog_cost_estimate_usd"] += part.get("cost", 0)
    return result


def config_for(provider):
    config = json.loads((ROOT / "config/opencode-groq-free.json").read_text())
    if provider == "opencode":
        config["model"] = config["small_model"] = MODEL[provider]
        config["enabled_providers"] = ["opencode"]
        config["provider"] = {"opencode": {"whitelist": ["big-pickle"], "models": {"big-pickle": {"limit": {"context": 7000, "output": 1000}}}}}
    return config


def evaluate(work, node):
    """Execute generated code without credentials, as a separate Linux UID."""
    if not shutil.which("sudo"):
        return {"status": "sandbox_unavailable"}
    acceptance = work / "acceptance.mjs"
    acceptance.write_text((ROOT / "experiments/groq/acceptance.mjs").read_text())
    for path in [work, *work.rglob("*")]:
        if not path.is_symlink():
            path.chmod(0o755 if path.is_dir() else 0o644)
    results = {}
    for label, testfile in [("agent_tests", "tests/paddle.test.js"), ("independent_tests", "acceptance.mjs")]:
        command = ["sudo", "-u", "nobody", "env", "-i", "PATH=/usr/bin:/bin", node, "--test", testfile]
        try:
            process = subprocess.run(command, cwd=work, env=environment(), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=15)
            results[label] = {"exit_code": process.returncode}
        except subprocess.TimeoutExpired:
            results[label] = {"exit_code": 124}
    results["status"] = "passed" if all(results[k]["exit_code"] == 0 for k in ("agent_tests", "independent_tests")) else "failed"
    acceptance.unlink(missing_ok=True)
    return results


def run_provider(provider, request, cli, output):
    record = {"provider": provider, "model": MODEL[provider], "opencode_version": "1.19.6", "status": "pending"}
    key = os.environ.get("GROQ_API_KEY", "")
    if provider == "groq":
        if not request.get("free_plan_confirmed"):
            return {**record, "status": "blocked_free_plan_unconfirmed"}
        if not key:
            return {**record, "status": "blocked_missing_secret"}
        availability = verify_groq(key)
        record["availability"] = availability
        if availability != "available":
            return {**record, "status": "blocked_preflight"}
    with tempfile.TemporaryDirectory(prefix="breakout-provider-") as temporary:
        parent = Path(temporary)
        parent.chmod(0o755)
        work = parent / "work"
        work.mkdir()
        (work / "src").mkdir()
        (work / "tests").mkdir()
        (work / "package.json").write_text('{"private":true,"type":"module"}\n')
        (work / "opencode.json").write_text(json.dumps(config_for(provider)))
        (work / "AGENTS.md").write_text("Only write src/paddle.js and tests/paddle.test.js. No shell, secrets, external paths or network. Coordinator runs tests.\n")
        original = {str(p.relative_to(work)): p.read_bytes() for p in work.rglob("*") if p.is_file()}
        child_env = environment()
        child_env.update({"CI": "true", "XDG_CONFIG_HOME": str(parent / "config"), "XDG_DATA_HOME": str(parent / "data"), "XDG_CACHE_HOME": str(parent / "cache")})
        if provider == "groq":
            child_env["GROQ_API_KEY"] = key
        task = (ROOT / "experiments/groq/task.md").read_text()
        record["task_sha256"] = hashlib.sha256(task.encode()).hexdigest()
        start = time.monotonic()
        command = [cli, "run", "--pure", "--auto", "--agent", "benchmark", "--model", MODEL[provider], "--format", "json", "--title", "Provider paddle benchmark", task]
        try:
            process = subprocess.run(command, cwd=work, env=child_env, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=300)
            raw = process.stdout.decode(errors="replace")
            record["agent_exit_code"] = process.returncode
        except subprocess.TimeoutExpired as error:
            raw = (error.stdout or b"").decode(errors="replace")
            record["agent_exit_code"] = 124
        record["duration_seconds"] = round(time.monotonic() - start, 3)
        record.update(summarize_events(raw))
        record["rate_limit_detected"] = "429" in raw or "rate_limit" in raw.lower() or "usage limit" in raw.lower()
        # Raw output is never printed or persisted. Catalog estimates are not billing.
        del raw
        actual = {str(p.relative_to(work)) for p in work.rglob("*") if p.is_file() or p.is_symlink()}
        invalid = [name for name in actual if name not in ALLOWED and (name not in original or (work / name).is_symlink() or (work / name).read_bytes() != original[name])]
        missing = [name for name in ALLOWED if not (work / name).is_file() or (work / name).is_symlink()]
        if invalid or missing:
            return {**record, "status": "invalid_or_missing_files", "missing_files": sorted(missing), "unauthorized_changes": bool(invalid)}
        if any((key and key.encode() in (work / name).read_bytes()) or re.search(rb"gsk_[A-Za-z0-9_-]{10,}", (work / name).read_bytes()) for name in ALLOWED):
            return {**record, "status": "sensitive_output_rejected"}
        record["validation"] = evaluate(work, shutil.which("node"))
        record["status"] = "passed" if record["agent_exit_code"] == 0 and record["error_events"] == 0 and record["validation"]["status"] == "passed" else "failed"
        # Only the two allowed generated files, never config or credential state.
        target = output / provider
        for name in ALLOWED:
            destination = target / name
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(work / name, destination)
    return record


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--cli", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    request = json.loads((ROOT / "experiments/groq/request.json").read_text())
    if any(provider not in MODEL for provider in request["providers"]):
        raise SystemExit("Unsupported provider")
    output = Path(args.output).resolve()
    output.mkdir(parents=True, exist_ok=True)
    records = []
    for provider in request["providers"]:
        try:
            record = run_provider(provider, request, str(Path(args.cli).resolve()), output)
        except Exception as error:
            record = {"provider": provider, "status": "runner_error", "error_type": type(error).__name__}
        records.append(record)
        print(json.dumps({"provider": provider, "status": record["status"]}), flush=True)
    result = {"experiment": request["experiment"], "records": records, "billing_note": "Catalog token cost estimates are not Groq Free account charges; no billing configuration was changed."}
    (output / "result.json").write_text(json.dumps(result, indent=2) + "\n")
    lines = ["# Provider experiment", "", "Same task and OpenCode 1.19.6; isolated from published Breakout.", "", "| Provider | Status | Seconds | Steps | Input/output tokens |", "|---|---|---:|---:|---:|"]
    for record in records:
        lines.append(f"| {record['provider']} | {record['status']} | {record.get('duration_seconds', '-')} | {record.get('steps', '-')} | {record.get('input_tokens', '-')} / {record.get('output_tokens', '-')} |")
    lines.extend(["", "Each generated module is checked by agent tests and independent acceptance tests. A passing scaffold does not count.", "Catalog token estimates do not identify actual Free-tier billing. No inference comparison is possible for a blocked provider.", "Historical V1 generation (25 steps / 1059.994s) was a different task, not a speed baseline.", ""])
    (output / "RESULT.md").write_text("\n".join(lines))
    return 0 if len(records) == 2 and all(record["status"] == "passed" for record in records) else 1


if __name__ == "__main__":
    raise SystemExit(main())
