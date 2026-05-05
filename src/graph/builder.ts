import { readFile } from "fs/promises";
import { scanKotlinFiles } from "../parser/kotlin/scanner";
import { type FileInfo } from "../parser/fileInfo";
import { parseKotlinFile, resolveDependencyToPackage } from "../parser/kotlin/parser";

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

  const fileInfos: FileInfo[] = await Promise.all(
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
        info.dependencies
          .map((dep) => resolveDependencyToPackage(dep))
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
