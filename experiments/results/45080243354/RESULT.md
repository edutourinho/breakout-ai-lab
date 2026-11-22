# Provider experiment

Same task and OpenCode 1.19.6; isolated from published Breakout.

| Provider | Status | Seconds | Steps | Input/output tokens |
|---|---|---:|---:|---:|
| opencode | invalid_or_missing_files | 19.867 | 1 | 1762 / 0 |
| groq | passed | 179.783 | 7 | 22473 / 2883 |

Each generated module is checked by agent tests and independent acceptance tests. A passing scaffold does not count.
Catalog token estimates do not identify actual Free-tier billing. No inference comparison is possible for a blocked provider.
Historical V1 generation (25 steps / 1059.994s) was a different task, not a speed baseline.
