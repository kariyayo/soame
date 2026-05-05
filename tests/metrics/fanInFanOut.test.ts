import { describe, expect, it } from "bun:test";
import { calculateFanInFanOut } from "../../src/metrics/fanInFanOut";
import { calculateAcd } from "../../src/metrics/acd";
import type { DependencyGraph } from "../../src/graph/builder";

describe("calculateFanInFanOut", () => {
  it("空のグラフは entries=[], componentCount=0", () => {
    const graph: DependencyGraph = { nodes: [] };
    const result = calculateFanInFanOut(graph);
    expect(result.entries).toHaveLength(0);
    expect(result.componentCount).toBe(0);
  });

  it("依存なしの単一ノード: fanIn=1, fanOut=1（自分自身を含む）", () => {
    const graph: DependencyGraph = {
      nodes: [{ filePath: "/A.kt", packageName: "com.example.a", dependsOn: [] }],
    };
    const result = calculateFanInFanOut(graph);
    expect(result.entries[0].fanIn).toBe(1);
    expect(result.entries[0].fanOut).toBe(1);
  });

  it("A→B（2ノード）: A.fanOut=1.0, A.fanIn=0.5, B.fanOut=0.5, B.fanIn=1.0", () => {
    const graph: DependencyGraph = {
      nodes: [
        { filePath: "/A.kt", packageName: "com.example.a", dependsOn: ["/B.kt"] },
        { filePath: "/B.kt", packageName: "com.example.b", dependsOn: [] },
      ],
    };
    const result = calculateFanInFanOut(graph);
    const a = result.entries.find((e) => e.packageName === "com.example.a")!;
    const b = result.entries.find((e) => e.packageName === "com.example.b")!;
    expect(a.fanOut).toBe(1.0);
    expect(a.fanIn).toBe(0.5);
    expect(b.fanOut).toBe(0.5);
    expect(b.fanIn).toBe(1.0);
  });

  it("A→B→C の鎖: A.fanOut=1, B.fanOut=2/3, C.fanOut=1/3, A.fanIn=1/3, B.fanIn=2/3, C.fanIn=1", () => {
    const graph: DependencyGraph = {
      nodes: [
        { filePath: "/A.kt", packageName: "com.example.a", dependsOn: ["/B.kt"] },
        { filePath: "/B.kt", packageName: "com.example.b", dependsOn: ["/C.kt"] },
        { filePath: "/C.kt", packageName: "com.example.c", dependsOn: [] },
      ],
    };
    const result = calculateFanInFanOut(graph);
    const a = result.entries.find((e) => e.packageName === "com.example.a")!;
    const b = result.entries.find((e) => e.packageName === "com.example.b")!;
    const c = result.entries.find((e) => e.packageName === "com.example.c")!;
    expect(a.fanOut).toBeCloseTo(3 / 3, 10);
    expect(b.fanOut).toBeCloseTo(2 / 3, 10);
    expect(c.fanOut).toBeCloseTo(1 / 3, 10);
    expect(a.fanIn).toBeCloseTo(1 / 3, 10);
    expect(b.fanIn).toBeCloseTo(2 / 3, 10);
    expect(c.fanIn).toBeCloseTo(3 / 3, 10);
  });

  it("ファンアウトの合計値 = ACD（PRDの整合性確認）", () => {
    const graph: DependencyGraph = {
      nodes: [
        { filePath: "/A.kt", packageName: "com.example.a", dependsOn: ["/B.kt"] },
        { filePath: "/B.kt", packageName: "com.example.b", dependsOn: ["/C.kt"] },
        { filePath: "/C.kt", packageName: "com.example.c", dependsOn: [] },
      ],
    };
    const fanResult = calculateFanInFanOut(graph);
    const acdResult = calculateAcd(graph);
    const sumFanOut = fanResult.entries.reduce((sum, e) => sum + e.fanOut, 0);
    expect(sumFanOut).toBeCloseTo(acdResult.acd, 10);
  });

  it("循環依存 A→B→A: fanIn=fanOut=1.0", () => {
    const graph: DependencyGraph = {
      nodes: [
        { filePath: "/A.kt", packageName: "com.example.a", dependsOn: ["/B.kt"] },
        { filePath: "/B.kt", packageName: "com.example.b", dependsOn: ["/A.kt"] },
      ],
    };
    const result = calculateFanInFanOut(graph);
    for (const entry of result.entries) {
      expect(entry.fanIn).toBe(1.0);
      expect(entry.fanOut).toBe(1.0);
    }
  });
});
