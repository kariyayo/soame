import { parseArgs } from "./cli";

const args = process.argv.slice(2);
const parsed = parseArgs(args);

if (parsed.error) {
  console.error(parsed.error);
  process.exit(1);
}

console.log(`対象ディレクトリ: ${parsed.targetDir}`);
// TODO: メトリクス計算を実行する
