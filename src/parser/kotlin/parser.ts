import type { FileInfo } from "../fileInfo";

export function parseKotlinFile(filePath: string, content: string): FileInfo {
  const lines = content.split("\n");
  let packageName = "";
  const imports: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("//")) {
      continue;
    }

    const packageMatch = trimmed.match(/^package\s+(\S+)/);
    if (packageMatch && packageMatch[1]) {
      packageName = packageMatch[1];
      continue;
    }

    const importMatch = trimmed.match(/^import\s+(\S+)/);
    if (importMatch && importMatch[1]) {
      imports.push(importMatch[1]);
    }
  }

  return { filePath, packageName, dependencies: imports };
}

export function resolveDependencyToPackage(dependencyPath: string): string | null {
  if (dependencyPath.endsWith(".*")) {
    return dependencyPath.slice(0, -2);
  }
  const parts = dependencyPath.split(".");
  if (parts.length < 2) return null;
  return parts.slice(0, -1).join(".");
}
