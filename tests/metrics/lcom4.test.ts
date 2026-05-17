import { describe, expect, it } from "bun:test";
import { calculateLcom4, type ClassInfo } from "../../src/metrics/lcom4";

describe("calculateLcom4", () => {
  it("メソッドとプロパティがすべて繋がっている場合は LCOM4 = 1", () => {
    const info: ClassInfo = {
      className: "CohesiveClass",
      methods: ["m1", "m2"],
      properties: ["p1"],
      references: new Map([
        ["m1", ["p1"]],
        ["m2", ["p1"]],
      ]),
    };
    expect(calculateLcom4(info)).toBe(1);
  });

  it("メソッド同士が直接依存している場合も LCOM4 = 1", () => {
    const info: ClassInfo = {
      className: "MethodCallClass",
      methods: ["m1", "m2"],
      properties: [],
      references: new Map([
        ["m1", ["m2"]],
      ]),
    };
    expect(calculateLcom4(info)).toBe(1);
  });

  it("全く独立したメソッド群がある場合は LCOM4 = 2", () => {
    const info: ClassInfo = {
      className: "SplitClass",
      methods: ["m1", "m2"],
      properties: ["p1", "p2"],
      references: new Map([
        ["m1", ["p1"]],
        ["m2", ["p2"]],
      ]),
    };
    expect(calculateLcom4(info)).toBe(2);
  });

  it("何も持たないクラスは LCOM4 = 0", () => {
    const info: ClassInfo = {
      className: "EmptyClass",
      methods: [],
      properties: [],
      references: new Map(),
    };
    expect(calculateLcom4(info)).toBe(0);
  });

  it("循環参照がある場合も正しく計算できる", () => {
    const info: ClassInfo = {
      className: "CycleClass",
      methods: ["m1", "m2", "m3"],
      properties: [],
      references: new Map([
        ["m1", ["m2"]],
        ["m2", ["m3"]],
        ["m3", ["m1"]],
      ]),
    };
    expect(calculateLcom4(info)).toBe(1);
  });

  it("プロパティのみで使われていない場合はそれぞれ独立した成分となる", () => {
    const info: ClassInfo = {
      className: "UnusedPropsClass",
      methods: ["m1"],
      properties: ["p1", "p2"],
      references: new Map([
        ["m1", []],
      ]),
    };
    // m1, p1, p2 の3つが独立
    expect(calculateLcom4(info)).toBe(3);
  });
});
