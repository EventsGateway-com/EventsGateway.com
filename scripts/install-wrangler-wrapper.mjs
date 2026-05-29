#!/usr/bin/env node

import { chmodSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const binDir = path.join(rootDir, "node_modules", ".bin");
const wrapperScriptPath = path.join(rootDir, "scripts", "wrangler-wrapper.mjs");
const packageBinPath = path.join(rootDir, "node_modules", "wrangler", "bin", "wrangler.js");

function ensureDirectory(target) {
  if (!existsSync(target)) {
    mkdirSync(target, { recursive: true });
  }
}

function writePackageBinWrapper() {
  const content = [
    "#!/usr/bin/env node",
    `import ${JSON.stringify(pathToFileURL(wrapperScriptPath).href)};`
  ].join("\n");

  writeFileSync(packageBinPath, content, "utf8");
  chmodSync(packageBinPath, 0o755);
}

function writeUnixShim() {
  const target = path.join(binDir, "wrangler");
  const content = [
    "#!/bin/sh",
    "basedir=$(dirname \"$0\")",
    "exec node \"$basedir/../../scripts/wrangler-wrapper.mjs\" \"$@\""
  ].join("\n");

  writeFileSync(target, content, "utf8");
  chmodSync(target, 0o755);
}

function writeWindowsCmdWrapper() {
  const target = path.join(binDir, "wrangler.cmd");
  const content = [
    "@ECHO off",
    "node \"%~dp0\\..\\..\\scripts\\wrangler-wrapper.mjs\" %*"
  ].join("\r\n");

  writeFileSync(target, content, "utf8");
}

function writeWindowsPs1Wrapper() {
  const target = path.join(binDir, "wrangler.ps1");
  const content = [
    "$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent",
    "node \"$basedir\\..\\..\\scripts\\wrangler-wrapper.mjs\" $args"
  ].join("\r\n");

  writeFileSync(target, content, "utf8");
}

function main() {
  if (!existsSync(wrapperScriptPath)) {
    throw new Error(`Missing wrapper script at ${wrapperScriptPath}`);
  }
  if (!existsSync(packageBinPath)) {
    throw new Error(`Missing Wrangler bin entry at ${packageBinPath}`);
  }

  ensureDirectory(binDir);
  writePackageBinWrapper();
  writeUnixShim();
  writeWindowsCmdWrapper();
  writeWindowsPs1Wrapper();
}

main();
