export type KotlinFileInfo = {
  filePath: string;
  packageName: string;
  imports: string[];
};

export function parseKotlinFile(filePath: string, content: string): KotlinFileInfo {
  const lines = content.split("\n");
  let packageName = "";
  const imports: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("//")) {
      continue;
    }

    const packageMatch = trimmed.match(/^package\s+(\S+)/);
    if (packageMatch) {
      packageName = packageMatch[1];
      continue;
    }

    const importMatch = trimmed.match(/^import\s+(\S+)/);
    if (importMatch) {
      imports.push(importMatch[1]);
    }
  }

  return { filePath, packageName, imports };
}
