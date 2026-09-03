import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const declarationDirectory = new URL("../dist/", import.meta.url);

for (const entry of await readdir(declarationDirectory, {
  withFileTypes: true,
})) {
  if (!entry.isFile() || !entry.name.endsWith(".d.ts")) continue;

  const path = join(declarationDirectory.pathname, entry.name);
  const source = await readFile(path, "utf8");
  const rewritten = source.replace(/(from\s+["'][^"']+)\.ts(["'])/g, "$1.js$2");
  await writeFile(path, rewritten);
}
