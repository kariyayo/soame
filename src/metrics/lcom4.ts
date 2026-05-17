import { readFile } from "fs/promises";
import type { ClassInfo } from "../parser/classInfo";
import { scanKotlinFiles } from "../parser/kotlin/scanner";
import { parseKotlinClass } from "../parser/kotlin/astParser";

export type Lcom4ClassResult = {
  className: string;
  lcom4: number;
};

export type Lcom4Result = {
  filePath: string;
  classes: Lcom4ClassResult[];
};

export async function calculateLcom4(targetDir: string): Promise<Lcom4Result[]> {
  const filePaths = await scanKotlinFiles(targetDir);
  const results: Lcom4Result[] = await Promise.all(
    filePaths.map(async (filePath) => {
      const content = await readFile(filePath, "utf-8");
      const classInfos = parseKotlinClass(content);
      return {
        filePath,
        classes: classInfos.map((info) => ({
          className: info.className,
          lcom4: _calculateLcom4(info),
        })),
      };
    })
  );
  return results;
}

function _calculateLcom4(classInfo: ClassInfo): number {
  const elements = [...classInfo.methods, ...classInfo.properties];
  if (elements.length === 0) return 0;

  const adj = new Map<string, Set<string>>();
  elements.forEach((e) => adj.set(e, new Set()));

  for (const [method, refs] of classInfo.references) {
    for (const ref of refs) {
      if (adj.has(ref)) {
        adj.get(method)!.add(ref);
        adj.get(ref)!.add(method);
      }
    }
  }

  const visited = new Set<string>();
  let components = 0;

  for (const element of elements) {
    if (!visited.has(element)) {
      components++;
      const stack = [element];
      while (stack.length > 0) {
        const current = stack.pop()!;
        if (visited.has(current)) continue;
        visited.add(current);
        for (const neighbor of adj.get(current)!) {
          if (!visited.has(neighbor)) {
            stack.push(neighbor);
          }
        }
      }
    }
  }

  return components;
}
