import { describe, expect, it } from "bun:test";
import { parseArgs } from "../src/cli";

describe("parseArgs", () => {
  it("対象ディレクトリのパスを受け取る", () => {
    const result = parseArgs(["/path/to/project"]);
    expect(result.targetDir).toBe("/path/to/project");
  });

  it("引数がない場合はエラーを返す", () => {
    const result = parseArgs([]);
    expect(result.error).toBeDefined();
  });
});
