import { describe, expect, it } from "bun:test";
import { formatAcdResult } from "../../src/metrics/formatter";
import type { AcdResult } from "../../src/metrics/acd";

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
