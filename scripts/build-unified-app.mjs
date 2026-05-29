import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";

const rootDir = path.resolve(".");
const rootDistDir = path.join(rootDir, "dist");
const dashboardDir = path.join(rootDir, "apps", "dashboard");
const dashboardDistDir = path.join(dashboardDir, "dist");
const dashboardTargetDir = path.join(rootDistDir, "__dashboard");

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

async function copyDirectory(source, target) {
  await fs.mkdir(target, { recursive: true });
  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
      continue;
    }
    await fs.copyFile(sourcePath, targetPath);
  }
}

async function cleanDashboardOutput() {
  await fs.rm(dashboardTargetDir, { recursive: true, force: true });
}

async function mergeDashboardIntoRootDist() {
  await cleanDashboardOutput();
  await fs.mkdir(dashboardTargetDir, { recursive: true });
  await fs.copyFile(path.join(dashboardDistDir, "index.html"), path.join(dashboardTargetDir, "index.html"));

  const dashboardAssetsDir = path.join(dashboardDistDir, "assets");
  try {
    await fs.access(dashboardAssetsDir);
    await copyDirectory(dashboardAssetsDir, path.join(rootDistDir, "assets"));
  } catch {
    return;
  }
}

async function main() {
  await run("npx", ["astro", "check"], rootDir);
  await run("npx", ["astro", "build"], rootDir);
  await run("npm", ["--prefix", "apps/dashboard", "clean-install", "--progress=false"], rootDir);
  await run("npm", ["--prefix", "apps/dashboard", "run", "build"], rootDir);
  await mergeDashboardIntoRootDist();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
