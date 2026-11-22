Create exactly two files: src/paddle.js and tests/paddle.test.js. No other edits.
Export movePaddle(paddle, direction, dt, worldWidth) as a named ES module export.
paddle contains x, width, speed and may contain other properties. Inputs are finite and valid: direction is -1, 0 or 1; dt >= 0; worldWidth >= paddle.width; speed >= 0.
Return a NEW object preserving every property except x. Compute x + direction * speed * dt and clamp it to [0, worldWidth - paddle.width]. Do not mutate the input.
Write node:test tests using node:assert/strict for movement left/right, zero direction/time, both clamps, exact limits and immutability. Use no imports except node:test, node:assert/strict and ../src/paddle.js. The coordinator will execute your tests and independent acceptance tests. You have no shell or web tools. Write the files directly and finish concisely. No package/config edits, subagents, commits or network calls.
