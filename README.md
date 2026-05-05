# soame

ソフトウェアアーキテクチャメトリクスを計算・可視化するCLIツール。

指定したディレクトリ内のKotlinソースコードを解析し、コンポーネント間の依存関係に基づいてメトリクスを計算する。

## 必要環境

- [Bun](https://bun.sh/) v1.0 以上

## セットアップ

```sh
bun install
```

## 使い方

```sh
bun run src/index.ts <対象ディレクトリ> [オプション]
```

### オプション

| オプション | 説明 |
|-----------|------|
| なし      | 伝搬コスト（Propagation Cost）を表示 |
| `-u`      | ファンイン／ファンアウトをコンポーネント別に表示 |
| `-a`      | ACD（平均コンポーネント依存値）サマリを表示 |
| `-g`      | コンポーネント間の依存グラフを表示 |

### 実行例

```sh
# 伝搬コスト（デフォルト）
bun run src/index.ts ./path/to/project

# ファンイン／ファンアウト
bun run src/index.ts ./path/to/project -u

# ACD サマリ
bun run src/index.ts ./path/to/project -a

# 依存グラフ
bun run src/index.ts ./path/to/project -g
```

## メトリクス

### 伝搬コスト（Propagation Cost）

コードベース全体の結合度を表すスカラー値。ACD をコンポーネント数で割った値（= 平均ファンアウト = 平均ファンイン）。

```
=== Propagation Cost ===
Components: 310
Propagation Cost: 1.52%
Severity: low
```

システム規模に応じた判定基準:

| コンポーネント数 | 注意レベル |
|---------------|----------|
| n < 500 | 判定対象外（low） |
| 500 ≤ n < 5000 | 20% 以上で warning、50% 以上で alert |
| n ≥ 5000 | 10% 以上で warning |

### ファンイン／ファンアウト（`-u`）

コンポーネントごとに依存の広がりを示す指標。

- **ファンアウト**: そのコンポーネントから推移的に到達できるコンポーネント数 / 全コンポーネント数
- **ファンイン**: そのコンポーネントに推移的に到達できるコンポーネント数 / 全コンポーネント数

```
=== Fan-in / Fan-out ===
Components: 310

Package (File)                     Fan-in   Fan-out
---------------------------------------------------
com.example.core (Foo.kt)          0.213    0.006
com.example.feature (Bar.kt)       0.035    0.045
```

### ACD（`-a`）

ACD（Average Component Dependency）は、コンポーネントが推移的に依存するコンポーネント数の平均。CCD（Cumulative Component Dependency）をコンポーネント数で割った値。

```
=== ACD ===
Components: 310
CCD: 1461
ACD: 4.71
```

### 依存グラフ（`-g`）

各コンポーネントとその直接依存先を一覧表示する。

```
com.example.a (A.kt)
  → com.example.b (B.kt)
com.example.b (B.kt)
  (no dependencies)
```

## 開発

```sh
# テスト実行
bun test

# ウォッチモード
bun test --watch
```
