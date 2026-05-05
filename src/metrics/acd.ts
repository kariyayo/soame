import type { DependencyGraph, DependencyNode } from "../graph/builder";

export type ComponentDependency = {
  filePath: string;
  packageName: string;
  dependencyCount: number;
};

export type AcdResult = {
  components: ComponentDependency[];
  ccd: number;
  acd: number;
  componentCount: number;
};

export function calculateAcd(graph: DependencyGraph): AcdResult {
  const componentCount = graph.nodes.length;
  if (componentCount === 0) {
    return { components: [], ccd: 0, acd: 0, componentCount: 0 };
  }

  const filePathToNode = new Map<string, DependencyNode>(
    graph.nodes.map((n) => [n.filePath, n])
  );

  const components: ComponentDependency[] = graph.nodes.map((node) => ({
    filePath: node.filePath,
    packageName: node.packageName,
    dependencyCount: countReachable(node, filePathToNode),
  }));

  const ccd = components.reduce((sum, c) => sum + c.dependencyCount, 0);
  const acd = ccd / componentCount;

  return { components, ccd, acd, componentCount };
}

function countReachable(
  start: DependencyNode,
  filePathToNode: Map<string, DependencyNode>
): number {
  const visited = new Set<string>();
  const queue = [start.filePath];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    const node = filePathToNode.get(current);
    if (node) {
      for (const dep of node.dependsOn) queue.push(dep);
    }
  }
  return visited.size;
}
