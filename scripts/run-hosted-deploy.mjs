#!/usr/bin/env node

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const child = spawn(process.execPath, ["./node_modules/wrangler/wrangler-dist/cli.js", "deploy"], {
  cwd: rootDir,
  stdio: "inherit",
  env: {
    ...process.env,
    EVENTSGATEWAY_FULL_STACK_DEPLOY: "1"
  },
  shell: false
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
