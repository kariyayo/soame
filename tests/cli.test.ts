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

  it("-g オプションなしの場合 showGraph は false", () => {
    const result = parseArgs(["/path/to/project"]);
    expect(result.showGraph).toBe(false);
  });

  it("-g オプションありの場合 showGraph は true", () => {
    const result = parseArgs(["/path/to/project", "-g"]);
    expect(result.showGraph).toBe(true);
  });

  it("-g オプションは対象ディレクトリの前後どちらでも受け取れる", () => {
    const result = parseArgs(["-g", "/path/to/project"]);
    expect(result.targetDir).toBe("/path/to/project");
    expect(result.showGraph).toBe(true);
  });

  it("-a オプションなしの場合 showAcd は false", () => {
    const result = parseArgs(["/path/to/project"]);
    expect(result.showAcd).toBe(false);
  });

  it("-a オプションありの場合 showAcd は true", () => {
    const result = parseArgs(["/path/to/project", "-a"]);
    expect(result.showAcd).toBe(true);
  });

  it("-u オプションなしの場合 showFanInFanOut は false", () => {
    const result = parseArgs(["/path/to/project"]);
    expect(result.showFanInFanOut).toBe(false);
  });

  it("-u オプションありの場合 showFanInFanOut は true", () => {
    const result = parseArgs(["/path/to/project", "-u"]);
    expect(result.showFanInFanOut).toBe(true);
  });
});
