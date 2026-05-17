import { describe, expect, it } from "bun:test";
import { parseKotlinForLcom4 } from "../../src/parser/kotlin/astParser";

describe("parseKotlinForLcom4", () => {
  it("シンプルなクラスの構造を抽出できる", () => {
    const code = `
      class MyClass {
        val p1 = 1
        fun m1() {
          println(p1)
        }
        fun m2() {
          m1()
        }
      }
    `;
    const classes = parseKotlinForLcom4(code);
    expect(classes.length).toBe(1);
    const c = classes[0];
    expect(c.className).toBe("MyClass");
    expect(c.properties).toContain("p1");
    expect(c.methods).toContain("m1");
    expect(c.methods).toContain("m2");
    expect(c.references.get("m1")).toContain("p1");
    expect(c.references.get("m2")).toContain("m1");
  });

  it("複数のクラスがある場合も抽出できる", () => {
    const code = `
      class A { fun fa() {} }
      class B { fun fb() {} }
    `;
    const classes = parseKotlinForLcom4(code);
    expect(classes.length).toBe(2);
    expect(classes[0].className).toBe("A");
    expect(classes[1].className).toBe("B");
  });
});
