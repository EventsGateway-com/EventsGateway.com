#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const realWranglerCli = path.join(rootDir, "node_modules", "wrangler", "wrangler-dist", "cli.js");
const args = process.argv.slice(2);

async function main() {
  if (!existsSync(realWranglerCli)) {
    throw new Error(`Wrangler CLI not found at ${realWranglerCli}`);
  }

  await new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ["--no-warnings", "--experimental-vm-modules", ...process.execArgv, realWranglerCli, ...args],
      {
        cwd: process.cwd(),
        stdio: "inherit",
        env: process.env,
        shell: false
      }
    );

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Command failed with exit code ${code ?? 1}`));
    });
  });
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[eventsgateway] ${message}`);
  process.exit(1);
});
