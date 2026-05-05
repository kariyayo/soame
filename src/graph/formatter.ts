import { basename } from "path";
import type { DependencyGraph, DependencyNode } from "./builder";

export function formatDependencyGraph(graph: DependencyGraph): string {
  const filePathToNode = new Map<string, DependencyNode>(
    graph.nodes.map((n) => [n.filePath, n])
  );

  const sorted = [...graph.nodes].sort((a, b) =>
    a.packageName.localeCompare(b.packageName)
  );

  return sorted
    .map((node) => {
      const header = `${node.packageName} (${basename(node.filePath)})`;
      if (node.dependsOn.length === 0) {
        return `${header}\n  (no dependencies)`;
      }
      const deps = node.dependsOn
        .map((fp) => {
          const dep = filePathToNode.get(fp);
          return dep ? `  → ${dep.packageName} (${basename(fp)})` : `  → ${fp}`;
        })
        .join("\n");
      return `${header}\n${deps}`;
    })
    .join("\n");
}
