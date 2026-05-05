import { describe, expect, it, afterEach } from "bun:test";
import { mkdtemp, writeFile, mkdir, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { scanKotlinFiles } from "../../src/kotlin/scanner";

describe("scanKotlinFiles", () => {
  const tmpDirs: string[] = [];

  afterEach(async () => {
    for (const dir of tmpDirs) {
      await rm(dir, { recursive: true, force: true });
    }
    tmpDirs.length = 0;
  });

  async function createTmpDir(): Promise<string> {
    const dir = await mkdtemp(join(tmpdir(), "soame-test-"));
    tmpDirs.push(dir);
    return dir;
  }

  it(".kt ファイルを再帰的に収集できる", async () => {
    const dir = await createTmpDir();
    await mkdir(join(dir, "sub"));
    await writeFile(join(dir, "Main.kt"), "");
    await writeFile(join(dir, "sub", "Foo.kt"), "");
    await writeFile(join(dir, "sub", "Bar.kt"), "");

    const result = await scanKotlinFiles(dir);

    expect(result).toContain(join(dir, "Main.kt"));
    expect(result).toContain(join(dir, "sub", "Foo.kt"));
    expect(result).toContain(join(dir, "sub", "Bar.kt"));
    expect(result.length).toBe(3);
  });

  it(".kt 以外のファイルは含まない", async () => {
    const dir = await createTmpDir();
    await writeFile(join(dir, "Main.kt"), "");
    await writeFile(join(dir, "README.md"), "");
    await writeFile(join(dir, "build.gradle"), "");

    const result = await scanKotlinFiles(dir);

    expect(result).toContain(join(dir, "Main.kt"));
    expect(result).not.toContain(join(dir, "README.md"));
    expect(result).not.toContain(join(dir, "build.gradle"));
    expect(result.length).toBe(1);
  });

  it("存在しないディレクトリはエラーをスローする", async () => {
    const nonExistentDir = "/tmp/soame-nonexistent-dir-xyz-123456";

    await expect(scanKotlinFiles(nonExistentDir)).rejects.toThrow();
  });

  it("結果がパスでソートされている", async () => {
    const dir = await createTmpDir();
    await mkdir(join(dir, "b"));
    await mkdir(join(dir, "a"));
    await writeFile(join(dir, "b", "Z.kt"), "");
    await writeFile(join(dir, "a", "A.kt"), "");
    await writeFile(join(dir, "Main.kt"), "");

    const result = await scanKotlinFiles(dir);

    const sorted = [...result].sort();
    expect(result).toEqual(sorted);
  });
});
