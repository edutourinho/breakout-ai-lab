# Provider experiment

Same task and OpenCode 1.19.6; isolated from published Breakout.

| Provider | Status | Seconds | Steps | Input/output tokens |
|---|---|---:|---:|---:|
| opencode | passed | 22.852 | 2 | 5859 / 1042 |
| groq | passed | 23.001 | 4 | 9148 / 1187 |

Each generated module is checked by agent tests and independent acceptance tests. A passing scaffold does not count.
Catalog token estimates do not identify actual Free-tier billing. No inference comparison is possible for a blocked provider.
Historical V1 generation (25 steps / 1059.994s) was a different task, not a speed baseline.
