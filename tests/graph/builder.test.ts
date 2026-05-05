import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdtemp, mkdir, writeFile, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { buildDependencyGraph } from "../../src/graph/builder";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), "soame-test-"));
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true });
});

describe("buildDependencyGraph", () => {
  it("依存関係がない場合、各ノードの dependsOn は空配列", async () => {
    await writeFile(
      join(tmpDir, "A.kt"),
      "package com.example.a\n"
    );
    await writeFile(
      join(tmpDir, "B.kt"),
      "package com.example.b\n"
    );

    const graph = await buildDependencyGraph(tmpDir);

    expect(graph.nodes).toHaveLength(2);
    for (const node of graph.nodes) {
      expect(node.dependsOn).toHaveLength(0);
    }
  });

  it("AがBのパッケージをimportしている場合、AはBに依存する", async () => {
    await writeFile(
      join(tmpDir, "A.kt"),
      "package com.example.a\nimport com.example.b.Foo\n"
    );
    await writeFile(
      join(tmpDir, "B.kt"),
      "package com.example.b\n"
    );

    const graph = await buildDependencyGraph(tmpDir);

    const nodeA = graph.nodes.find((n) => n.packageName === "com.example.a")!;
    const nodeB = graph.nodes.find((n) => n.packageName === "com.example.b")!;
    expect(nodeA.dependsOn).toEqual([nodeB.filePath]);
    expect(nodeB.dependsOn).toHaveLength(0);
  });

  it("プロジェクト外のimportは無視する", async () => {
    await writeFile(
      join(tmpDir, "A.kt"),
      "package com.example.a\nimport android.content.Context\nimport kotlinx.coroutines.flow.Flow\n"
    );

    const graph = await buildDependencyGraph(tmpDir);

    const nodeA = graph.nodes.find((n) => n.packageName === "com.example.a")!;
    expect(nodeA.dependsOn).toHaveLength(0);
  });

  it("ワイルドカードimportも解決できる", async () => {
    await writeFile(
      join(tmpDir, "A.kt"),
      "package com.example.a\nimport com.example.b.*\n"
    );
    await writeFile(
      join(tmpDir, "B.kt"),
      "package com.example.b\n"
    );

    const graph = await buildDependencyGraph(tmpDir);

    const nodeA = graph.nodes.find((n) => n.packageName === "com.example.a")!;
    const nodeB = graph.nodes.find((n) => n.packageName === "com.example.b")!;
    expect(nodeA.dependsOn).toEqual([nodeB.filePath]);
  });

  it("サブディレクトリのファイルも含めて依存関係を構築できる", async () => {
    await mkdir(join(tmpDir, "feature"));
    await writeFile(
      join(tmpDir, "A.kt"),
      "package com.example.a\nimport com.example.feature.Bar\n"
    );
    await writeFile(
      join(tmpDir, "feature", "B.kt"),
      "package com.example.feature\n"
    );

    const graph = await buildDependencyGraph(tmpDir);

    const nodeA = graph.nodes.find((n) => n.packageName === "com.example.a")!;
    const nodeB = graph.nodes.find((n) => n.packageName === "com.example.feature")!;
    expect(nodeA.dependsOn).toEqual([nodeB.filePath]);
  });

  it("A→B→C の多段依存を構築できる", async () => {
    await writeFile(
      join(tmpDir, "A.kt"),
      "package com.example.a\nimport com.example.b.B\n"
    );
    await writeFile(
      join(tmpDir, "B.kt"),
      "package com.example.b\nimport com.example.c.C\n"
    );
    await writeFile(
      join(tmpDir, "C.kt"),
      "package com.example.c\n"
    );

    const graph = await buildDependencyGraph(tmpDir);

    const nodeA = graph.nodes.find((n) => n.packageName === "com.example.a")!;
    const nodeB = graph.nodes.find((n) => n.packageName === "com.example.b")!;
    const nodeC = graph.nodes.find((n) => n.packageName === "com.example.c")!;
    expect(nodeA.dependsOn).toEqual([nodeB.filePath]);
    expect(nodeB.dependsOn).toEqual([nodeC.filePath]);
    expect(nodeC.dependsOn).toHaveLength(0);
  });
});
