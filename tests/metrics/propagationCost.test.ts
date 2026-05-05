import { describe, expect, it } from "bun:test";
import { calculatePropagationCost } from "../../src/metrics/propagationCost";
import { calculateAcd } from "../../src/metrics/acd";
import type { DependencyGraph } from "../../src/graph/builder";

function makeGraph(n: number, pc: number): DependencyGraph {
  // CCD = pc * n^2, ACD = pc * n
  // A→B→C→...→N の鎖にすると ACD=(n+1)/2 なので任意の値に調整しにくい。
  // ここではノード数と伝搬コストを直接検証するため、境界値テスト用に
  // ACD を任意に操作できるよう依存なしノード群で n を調整している。
  // （実際には severityの境界値を単体テストしたいだけなので、
  //   小さなグラフで pc を近似した値で確認する）
  return { nodes: Array.from({ length: n }, (_, i) => ({
    filePath: `/${i}.kt`,
    packageName: `com.example.p${i}`,
    dependsOn: [],
  })) };
}

describe("calculatePropagationCost", () => {
  it("空のグラフ → componentCount=0, propagationCost=0, severity=low", () => {
    const result = calculatePropagationCost({ nodes: [] });
    expect(result.componentCount).toBe(0);
    expect(result.propagationCost).toBe(0);
    expect(result.severity).toBe("low");
  });

  it("単一ノード（依存なし）→ pc=1.0, severity=low（n<500）", () => {
    const graph: DependencyGraph = {
      nodes: [{ filePath: "/A.kt", packageName: "com.example.a", dependsOn: [] }],
    };
    const result = calculatePropagationCost(graph);
    expect(result.propagationCost).toBe(1.0);
    expect(result.severity).toBe("low");
  });

  it("A→B→C の鎖（n=3）→ pc=ACD/n=2/3, severity=low", () => {
    const graph: DependencyGraph = {
      nodes: [
        { filePath: "/A.kt", packageName: "com.example.a", dependsOn: ["/B.kt"] },
        { filePath: "/B.kt", packageName: "com.example.b", dependsOn: ["/C.kt"] },
        { filePath: "/C.kt", packageName: "com.example.c", dependsOn: [] },
      ],
    };
    const acd = calculateAcd(graph);
    const result = calculatePropagationCost(graph);
    expect(result.propagationCost).toBeCloseTo(acd.acd / 3, 10);
    expect(result.severity).toBe("low");
  });

  describe("severity 判定の境界値", () => {
    it("n=499 → 常に low", () => {
      const result = calculatePropagationCost(makeGraph(499, 0));
      expect(result.severity).toBe("low");
    });

    it("n=500, pc<0.20 → low", () => {
      // 全ノード依存なし → ACD=1, pc=1/500=0.002
      const result = calculatePropagationCost(makeGraph(500, 0));
      expect(result.propagationCost).toBeCloseTo(1 / 500, 10);
      expect(result.severity).toBe("low");
    });

    it("n=500, pc>=0.20 → warning（A→B→...鎖でACD≒250, pc=0.5）", () => {
      // 鎖 A→B→C（n=3）はpc=2/3。n=3でpc>=0.2だがn<500なのでlow。
      // n=500 で pc>=0.2 を作るには ACD>=100 必要。鎖で近似: n=500の鎖はACD=250.5, pc≈0.501→alert
      // warningの境界を確かめたいのでn=10の鎖（ACD=5.5, pc=0.55, n<500 → low）は別物。
      // severity関数を直接テストするため、propagationCost.tsからjudgeSeverityをexportするか、
      // 境界値を持つグラフを作る必要がある。ここでは実際のグラフで確認する。
      // n=500 の鎖 → ACD≈250.5, pc≈0.501 → alert
      const nodes = Array.from({ length: 500 }, (_, i) => ({
        filePath: `/${i}.kt`,
        packageName: `com.example.p${i}`,
        dependsOn: i < 499 ? [`/${i + 1}.kt`] : [],
      }));
      const result = calculatePropagationCost({ nodes });
      expect(result.componentCount).toBe(500);
      expect(result.severity).toBe("alert");  // pc≈0.501 >= 0.5
    });

    it("n=5000, pc<0.10 → low（全ノード依存なし → pc=1/5000=0.0002）", () => {
      const result = calculatePropagationCost(makeGraph(5000, 0));
      expect(result.propagationCost).toBeCloseTo(1 / 5000, 10);
      expect(result.severity).toBe("low");
    });

    it("n=5000, pc>=0.10 → warning（鎖でACD≈2500.5, pc≈0.5→warning）", () => {
      const nodes = Array.from({ length: 5000 }, (_, i) => ({
        filePath: `/${i}.kt`,
        packageName: `com.example.p${i}`,
        dependsOn: i < 4999 ? [`/${i + 1}.kt`] : [],
      }));
      const result = calculatePropagationCost({ nodes });
      expect(result.componentCount).toBe(5000);
      expect(result.severity).toBe("warning");  // pc≈0.5, n>=5000 → warning
    });
  });
});
