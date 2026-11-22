import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("provider_benchmark", Path(__file__).resolve().parents[2] / "scripts/provider_benchmark.py")
benchmark = importlib.util.module_from_spec(spec)
spec.loader.exec_module(benchmark)


class HarnessTests(unittest.TestCase):
    def test_unconfirmed_plan_never_calls_provider(self):
        with tempfile.TemporaryDirectory() as d, patch.object(benchmark, "verify_groq") as verify:
            result = benchmark.run_provider("groq", {"free_plan_confirmed": False}, "/unused", Path(d))
        self.assertEqual(result["status"], "blocked_free_plan_unconfirmed")
        verify.assert_not_called()

    def test_missing_secret_never_calls_provider(self):
        with tempfile.TemporaryDirectory() as d, patch.dict(benchmark.os.environ, {}, clear=True), patch.object(benchmark, "verify_groq") as verify:
            result = benchmark.run_provider("groq", {"free_plan_confirmed": True}, "/unused", Path(d))
        self.assertEqual(result["status"], "blocked_missing_secret")
        verify.assert_not_called()

    def test_secret_redacted_from_text_tool_errors_and_api_errors(self):
        secret = "gsk_" + "example" * 6
        events = [
            {"type": "text", "part": {"text": secret}},
            {"type": "error", "error": {"message": secret}},
            {"type": "tool_use", "part": {"tool": "read", "state": {"status": "error", "error": secret}}},
        ]
        result = benchmark.summarize_events("\n".join(map(json.dumps, events)), secret)
        self.assertNotIn(secret, json.dumps(result))
        self.assertIn("[REDACTED]", json.dumps(result))

    def test_parser_ignores_non_events_and_preserves_usage(self):
        raw = 'null\n[]\n"text"\nnoise\n' + json.dumps({"type": "step_finish", "part": {"cost": .01, "tokens": {"input": 21, "output": 13}}})
        result = benchmark.summarize_events(raw)
        self.assertEqual((result["steps"], result["input_tokens"], result["output_tokens"]), (1, 21, 13))
        self.assertEqual(result["catalog_cost_estimate_usd"], .01)

    def test_each_preset_exposes_one_provider_and_model_without_shell(self):
        for provider in ("groq", "opencode"):
            config = benchmark.config_for(provider)
            self.assertEqual(config["enabled_providers"], [provider])
            self.assertEqual(config["model"], benchmark.MODEL[provider])
            self.assertEqual(config["small_model"], benchmark.MODEL[provider])
            self.assertFalse(config["tools"]["*"])
            self.assertNotIn("bash", config["tools"])
            self.assertEqual(config["permission"]["external_directory"], "deny")


if __name__ == "__main__":
    unittest.main()
