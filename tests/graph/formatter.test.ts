import { describe, expect, it } from "bun:test";
import { formatDependencyGraph } from "../../src/graph/formatter";
import type { DependencyGraph } from "../../src/graph/builder";

describe("formatDependencyGraph", () => {
  it("依存関係がないノードを出力する", () => {
    const graph: DependencyGraph = {
      nodes: [
        { filePath: "/project/A.kt", packageName: "com.example.a", dependsOn: [] },
      ],
    };

    const output = formatDependencyGraph(graph);

    expect(output).toContain("com.example.a");
    expect(output).toContain("A.kt");
  });

  it("依存先のパッケージ名を出力する", () => {
    const graph: DependencyGraph = {
      nodes: [
        {
          filePath: "/project/A.kt",
          packageName: "com.example.a",
          dependsOn: ["/project/B.kt"],
        },
        { filePath: "/project/B.kt", packageName: "com.example.b", dependsOn: [] },
      ],
    };

    const output = formatDependencyGraph(graph);

    const lines = output.split("\n");
    const aLine = lines.findIndex((l) => l.includes("com.example.a"));
    expect(aLine).toBeGreaterThanOrEqual(0);
    expect(lines[aLine + 1]).toContain("com.example.b");
  });

  it("依存関係がないノードには (no dependencies) を表示する", () => {
    const graph: DependencyGraph = {
      nodes: [
        { filePath: "/project/A.kt", packageName: "com.example.a", dependsOn: [] },
      ],
    };

    const output = formatDependencyGraph(graph);

    expect(output).toContain("(no dependencies)");
  });

  it("ノードはパッケージ名でソートして出力する", () => {
    const graph: DependencyGraph = {
      nodes: [
        { filePath: "/project/B.kt", packageName: "com.example.b", dependsOn: [] },
        { filePath: "/project/A.kt", packageName: "com.example.a", dependsOn: [] },
      ],
    };

    const output = formatDependencyGraph(graph);

    const aPos = output.indexOf("com.example.a");
    const bPos = output.indexOf("com.example.b");
    expect(aPos).toBeLessThan(bPos);
  });
});
