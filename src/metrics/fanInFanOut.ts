import type { DependencyGraph, DependencyNode } from "../graph/builder";

export type FanInFanOutEntry = {
  filePath: string;
  packageName: string;
  fanIn: number;
  fanOut: number;
};

export type FanInFanOutResult = {
  entries: FanInFanOutEntry[];
  componentCount: number;
};

export function calculateFanInFanOut(graph: DependencyGraph): FanInFanOutResult {
  const componentCount = graph.nodes.length;
  if (componentCount === 0) {
    return { entries: [], componentCount: 0 };
  }

  const filePathToNode = new Map<string, DependencyNode>(
    graph.nodes.map((n) => [n.filePath, n])
  );
  const reverseAdj = buildReverseAdjacency(graph);

  const entries: FanInFanOutEntry[] = graph.nodes.map((node) => ({
    filePath: node.filePath,
    packageName: node.packageName,
    fanOut: countReachable(node.filePath, (fp) => filePathToNode.get(fp)?.dependsOn ?? []) / componentCount,
    fanIn: countReachable(node.filePath, (fp) => reverseAdj.get(fp) ?? []) / componentCount,
  }));

  return { entries, componentCount };
}

function buildReverseAdjacency(graph: DependencyGraph): Map<string, string[]> {
  const reverse = new Map<string, string[]>(graph.nodes.map((n) => [n.filePath, []]));
  for (const node of graph.nodes) {
    for (const dep of node.dependsOn) {
      reverse.get(dep)?.push(node.filePath);
    }
  }
  return reverse;
}

function countReachable(start: string, neighbors: (fp: string) => string[]): number {
  const visited = new Set<string>();
  const queue = [start];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    for (const next of neighbors(current)) queue.push(next);
  }
  return visited.size;
}
