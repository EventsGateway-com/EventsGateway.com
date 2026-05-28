import { minify } from "html-minifier-terser";
import { promises as fs } from "node:fs";
import path from "node:path";

const distDir = path.resolve("dist");

async function collectHtmlFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return collectHtmlFiles(fullPath);
      }
      return fullPath.endsWith(".html") ? [fullPath] : [];
    })
  );

  return files.flat();
}

async function minifyHtmlFile(filePath) {
  const source = await fs.readFile(filePath, "utf8");
  const output = await minify(source, {
    caseSensitive: true,
    collapseBooleanAttributes: true,
    collapseInlineTagWhitespace: true,
    collapseWhitespace: true,
    decodeEntities: true,
    minifyCSS: true,
    minifyJS: true,
    preserveLineBreaks: false,
    processConditionalComments: false,
    removeAttributeQuotes: false,
    removeComments: true,
    removeEmptyAttributes: false,
    removeOptionalTags: false,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    sortAttributes: true,
    sortClassName: true,
    trimCustomFragments: true
  });

  await fs.writeFile(filePath, output, "utf8");
}

async function main() {
  const htmlFiles = await collectHtmlFiles(distDir);
  await Promise.all(htmlFiles.map(minifyHtmlFile));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
