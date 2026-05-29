#!/usr/bin/env node

import { chmodSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const binDir = path.join(rootDir, "node_modules", ".bin");
const wrapperScriptPath = path.join(rootDir, "scripts", "wrangler-wrapper.mjs");

function ensureDirectory(target) {
  if (!existsSync(target)) {
    mkdirSync(target, { recursive: true });
  }
}

function writeUnixWrapper() {
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

  ensureDirectory(binDir);
  writeUnixWrapper();
  writeWindowsCmdWrapper();
  writeWindowsPs1Wrapper();
}

main();
