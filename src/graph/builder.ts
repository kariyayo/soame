import { readFile } from "fs/promises";
import { scanKotlinFiles } from "../kotlin/scanner";
import { parseKotlinFile, type KotlinFileInfo } from "../kotlin/parser";

export type DependencyNode = {
  filePath: string;
  packageName: string;
  dependsOn: string[];
};

export type DependencyGraph = {
  nodes: DependencyNode[];
};

export async function buildDependencyGraph(targetDir: string): Promise<DependencyGraph> {
  const filePaths = await scanKotlinFiles(targetDir);

  const fileInfos: KotlinFileInfo[] = await Promise.all(
    filePaths.map(async (filePath) => {
      const content = await readFile(filePath, "utf-8");
      return parseKotlinFile(filePath, content);
    })
  );

  const packageToFilePath = new Map<string, string>();
  for (const info of fileInfos) {
    if (info.packageName) {
      packageToFilePath.set(info.packageName, info.filePath);
    }
  }

  const nodes: DependencyNode[] = fileInfos.map((info) => {
    const dependsOn = [
      ...new Set(
        info.imports
          .map((imp) => resolveImportToPackage(imp))
          .filter((pkg): pkg is string => pkg !== null)
          .map((pkg) => packageToFilePath.get(pkg))
          .filter((fp): fp is string => fp !== undefined)
      ),
    ];

    return {
      filePath: info.filePath,
      packageName: info.packageName,
      dependsOn,
    };
  });

  return { nodes };
}

function resolveImportToPackage(importPath: string): string | null {
  if (importPath.endsWith(".*")) {
    return importPath.slice(0, -2);
  }
  const parts = importPath.split(".");
  if (parts.length < 2) return null;
  return parts.slice(0, -1).join(".");
}
