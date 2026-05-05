import { describe, expect, it } from "bun:test";
import { calculateAcd } from "../../src/metrics/acd";
import type { DependencyGraph } from "../../src/graph/builder";

describe("calculateAcd", () => {
  it("空のグラフは componentCount=0, ccd=0, acd=0", () => {
    const graph: DependencyGraph = { nodes: [] };
    const result = calculateAcd(graph);
    expect(result.componentCount).toBe(0);
    expect(result.ccd).toBe(0);
    expect(result.acd).toBe(0);
  });

  it("依存なしの単一ノードは dependencyCount=1, acd=1", () => {
    const graph: DependencyGraph = {
      nodes: [{ filePath: "/A.kt", packageName: "com.example.a", dependsOn: [] }],
    };
    const result = calculateAcd(graph);
    expect(result.components[0].dependencyCount).toBe(1);
    expect(result.ccd).toBe(1);
    expect(result.acd).toBe(1);
  });

  it("A→B の依存: A.dependencyCount=2, B.dependencyCount=1, ccd=3, acd=1.5", () => {
    const graph: DependencyGraph = {
      nodes: [
        { filePath: "/A.kt", packageName: "com.example.a", dependsOn: ["/B.kt"] },
        { filePath: "/B.kt", packageName: "com.example.b", dependsOn: [] },
      ],
    };
    const result = calculateAcd(graph);
    const a = result.components.find((c) => c.packageName === "com.example.a")!;
    const b = result.components.find((c) => c.packageName === "com.example.b")!;
    expect(a.dependencyCount).toBe(2);
    expect(b.dependencyCount).toBe(1);
    expect(result.ccd).toBe(3);
    expect(result.acd).toBe(1.5);
  });

  it("A→B→C の鎖: A=3, B=2, C=1, ccd=6, acd=2.0", () => {
    const graph: DependencyGraph = {
      nodes: [
        { filePath: "/A.kt", packageName: "com.example.a", dependsOn: ["/B.kt"] },
        { filePath: "/B.kt", packageName: "com.example.b", dependsOn: ["/C.kt"] },
        { filePath: "/C.kt", packageName: "com.example.c", dependsOn: [] },
      ],
    };
    const result = calculateAcd(graph);
    const a = result.components.find((c) => c.packageName === "com.example.a")!;
    const b = result.components.find((c) => c.packageName === "com.example.b")!;
    const c = result.components.find((c) => c.packageName === "com.example.c")!;
    expect(a.dependencyCount).toBe(3);
    expect(b.dependencyCount).toBe(2);
    expect(c.dependencyCount).toBe(1);
    expect(result.ccd).toBe(6);
    expect(result.acd).toBe(2.0);
  });

  it("循環依存 A→B→A は無限ループせずに計算できる: A=2, B=2, ccd=4, acd=2", () => {
    const graph: DependencyGraph = {
      nodes: [
        { filePath: "/A.kt", packageName: "com.example.a", dependsOn: ["/B.kt"] },
        { filePath: "/B.kt", packageName: "com.example.b", dependsOn: ["/A.kt"] },
      ],
    };
    const result = calculateAcd(graph);
    const a = result.components.find((c) => c.packageName === "com.example.a")!;
    const b = result.components.find((c) => c.packageName === "com.example.b")!;
    expect(a.dependencyCount).toBe(2);
    expect(b.dependencyCount).toBe(2);
    expect(result.ccd).toBe(4);
    expect(result.acd).toBe(2);
  });

  it("A→B, A→C の複数依存: A=3, B=1, C=1, ccd=5, acd≈1.67", () => {
    const graph: DependencyGraph = {
      nodes: [
        { filePath: "/A.kt", packageName: "com.example.a", dependsOn: ["/B.kt", "/C.kt"] },
        { filePath: "/B.kt", packageName: "com.example.b", dependsOn: [] },
        { filePath: "/C.kt", packageName: "com.example.c", dependsOn: [] },
      ],
    };
    const result = calculateAcd(graph);
    const a = result.components.find((c) => c.packageName === "com.example.a")!;
    expect(a.dependencyCount).toBe(3);
    expect(result.ccd).toBe(5);
    expect(result.acd).toBeCloseTo(5 / 3, 5);
  });
});
