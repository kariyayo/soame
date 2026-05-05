import { describe, expect, it } from "bun:test";
import { formatAcdResult, formatFanInFanOutResult, formatPropagationCostResult } from "../../src/metrics/formatter";
import type { AcdResult } from "../../src/metrics/acd";
import type { FanInFanOutResult } from "../../src/metrics/fanInFanOut";
import type { PropagationCostResult } from "../../src/metrics/propagationCost";

describe("formatAcdResult", () => {
  const result: AcdResult = {
    componentCount: 42,
    ccd: 168,
    acd: 4.0,
    components: [],
  };

  it("コンポーネント数を含む", () => {
    expect(formatAcdResult(result)).toContain("42");
  });

  it("CCDを含む", () => {
    expect(formatAcdResult(result)).toContain("168");
  });

  it("ACDを小数点2桁で含む", () => {
    expect(formatAcdResult(result)).toContain("4.00");
  });

  it("小数点以下が長い場合は2桁に丸める", () => {
    const r: AcdResult = { ...result, acd: 1.6666666 };
    expect(formatAcdResult(r)).toContain("1.67");
  });
});

describe("formatFanInFanOutResult", () => {
  const result: FanInFanOutResult = {
    componentCount: 3,
    entries: [
      { filePath: "/A.kt", packageName: "com.example.a", fanIn: 0.333, fanOut: 1.0 },
      { filePath: "/B.kt", packageName: "com.example.b", fanIn: 0.667, fanOut: 0.667 },
    ],
  };

  it("コンポーネント数を含む", () => {
    expect(formatFanInFanOutResult(result)).toContain("3");
  });

  it("パッケージ名を含む", () => {
    const output = formatFanInFanOutResult(result);
    expect(output).toContain("com.example.a");
    expect(output).toContain("com.example.b");
  });

  it("ソースファイル名を含む", () => {
    const output = formatFanInFanOutResult(result);
    expect(output).toContain("A.kt");
    expect(output).toContain("B.kt");
  });

  it("fanIn と fanOut を小数点3桁で含む", () => {
    const output = formatFanInFanOutResult(result);
    expect(output).toContain("0.333");
    expect(output).toContain("1.000");
  });
});

describe("formatPropagationCostResult", () => {
  it("コンポーネント数と伝搬コストをパーセント表示で含む", () => {
    const result: PropagationCostResult = {
      componentCount: 310,
      propagationCost: 0.0152,
      severity: "low",
    };
    const output = formatPropagationCostResult(result);
    expect(output).toContain("310");
    expect(output).toContain("1.52%");
  });

  it("severity=low のメッセージを含む", () => {
    const result: PropagationCostResult = { componentCount: 10, propagationCost: 0.5, severity: "low" };
    expect(formatPropagationCostResult(result)).toContain("low");
  });

  it("severity=warning のメッセージを含む", () => {
    const result: PropagationCostResult = { componentCount: 1000, propagationCost: 0.3, severity: "warning" };
    expect(formatPropagationCostResult(result)).toContain("warning");
  });

  it("severity=alert のメッセージを含む", () => {
    const result: PropagationCostResult = { componentCount: 1000, propagationCost: 0.6, severity: "alert" };
    expect(formatPropagationCostResult(result)).toContain("alert");
  });
});
