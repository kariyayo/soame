import { readdir, stat } from "fs/promises";
import { join } from "path";

export async function scanKotlinFiles(dir: string): Promise<string[]> {
  await stat(dir);

  const results: string[] = [];
  await collectKotlinFiles(dir, results);
  return results.sort();
}

async function collectKotlinFiles(dir: string, results: string[]): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectKotlinFiles(fullPath, results);
    } else if (entry.isFile() && entry.name.endsWith(".kt")) {
      results.push(fullPath);
    }
  }
}
