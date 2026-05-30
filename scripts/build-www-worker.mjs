import { spawn } from "node:child_process";
import path from "node:path";

process.noDeprecation = true;

const rootDir = path.resolve(".");

function run(command, args, cwd = rootDir) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      shell: process.platform === "win32"
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code ?? 1}`));
    });
  });
}

async function main() {
  await run("npx", ["astro", "check"], rootDir);
  await run("npx", ["astro", "build"], rootDir);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
