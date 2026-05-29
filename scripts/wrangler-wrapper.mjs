#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const realWranglerCli = path.join(rootDir, "node_modules", "wrangler", "wrangler-dist", "cli.js");
const args = process.argv.slice(2);

function hasExplicitEnvironment(input) {
  if (process.env.CLOUDFLARE_ENV?.trim()) {
    return true;
  }

  for (let index = 0; index < input.length; index += 1) {
    const value = input[index];
    if (value === "--env" || value === "-e") {
      return true;
    }
    if (value.startsWith("--env=")) {
      return true;
    }
  }

  return false;
}

function shouldRunHostedDeploy() {
  if (process.env.EVENTSGATEWAY_WRANGLER_WRAPPER_BYPASS === "1") {
    return false;
  }
  if (process.env.EVENTSGATEWAY_FULL_STACK_DEPLOY !== "1") {
    return false;
  }
  if (process.cwd() !== rootDir) {
    return false;
  }
  if (args[0] !== "deploy") {
    return false;
  }

  return !hasExplicitEnvironment(args);
}

function spawnCommand(command, commandArgs, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      cwd,
      stdio: "inherit",
      env: {
        ...process.env,
        EVENTSGATEWAY_WRANGLER_WRAPPER_BYPASS: "1"
      },
      shell: false
    });

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

function npmExecutable() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

async function installAppDependencies(relativePath) {
  console.log(`[eventsgateway] Installing dependencies for ${relativePath}`);
  await spawnCommand(npmExecutable(), ["--prefix", relativePath, "clean-install", "--progress=false"], rootDir);
}

async function runRealWrangler(commandArgs, cwd) {
  if (!existsSync(realWranglerCli)) {
    throw new Error(`Wrangler CLI not found at ${realWranglerCli}`);
  }

  await spawnCommand(
    process.execPath,
    ["--no-warnings", "--experimental-vm-modules", ...process.execArgv, realWranglerCli, ...commandArgs],
    cwd
  );
}

async function runHostedDeploy() {
  console.log("[eventsgateway] Running unified deploy for the single root worker");
  await runRealWrangler(["deploy", "--env", "production"], rootDir);
}

async function main() {
  if (shouldRunHostedDeploy()) {
    await runHostedDeploy();
    return;
  }

  await runRealWrangler(args, process.cwd());
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[eventsgateway] ${message}`);
  process.exit(1);
});
