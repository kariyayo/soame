import { describe, expect, it } from "bun:test";
import { parseKotlinFile } from "../../src/parser/kotlin/parser";

describe("parseKotlinFile", () => {
  it("パッケージ宣言とimport文を正しく抽出できる", () => {
    const content = `package com.example.feature

import com.example.other.Foo
import com.example.bar.Bar

class MyClass {}
`;
    const result = parseKotlinFile("/path/to/MyClass.kt", content);
    expect(result.filePath).toBe("/path/to/MyClass.kt");
    expect(result.packageName).toBe("com.example.feature");
    expect(result.dependencies).toEqual(["com.example.other.Foo", "com.example.bar.Bar"]);
  });

  it("import文がない場合はimportsが空配列", () => {
    const content = `package com.example.feature

class MyClass {}
`;
    const result = parseKotlinFile("/path/to/MyClass.kt", content);
    expect(result.packageName).toBe("com.example.feature");
    expect(result.dependencies).toEqual([]);
  });

  it("package宣言がない場合はpackageNameが空文字列", () => {
    const content = `import com.example.other.Foo

class MyClass {}
`;
    const result = parseKotlinFile("/path/to/MyClass.kt", content);
    expect(result.packageName).toBe("");
    expect(result.dependencies).toEqual(["com.example.other.Foo"]);
  });

  it("コメント行のimportは無視する", () => {
    const content = `package com.example.feature

// import com.example.ignored.Ignored
import com.example.other.Foo

class MyClass {}
`;
    const result = parseKotlinFile("/path/to/MyClass.kt", content);
    expect(result.packageName).toBe("com.example.feature");
    expect(result.dependencies).toEqual(["com.example.other.Foo"]);
  });

  it("ワイルドカードimportも含む", () => {
    const content = `package com.example.feature

import com.example.other.*
import com.example.bar.Bar

class MyClass {}
`;
    const result = parseKotlinFile("/path/to/MyClass.kt", content);
    expect(result.packageName).toBe("com.example.feature");
    expect(result.dependencies).toEqual(["com.example.other.*", "com.example.bar.Bar"]);
  });
});
