import { parseArgs } from "./cli";
import { buildDependencyGraph } from "./graph/builder";
import { formatDependencyGraph } from "./graph/formatter";

const args = process.argv.slice(2);
const parsed = parseArgs(args);

if (parsed.error) {
  console.error(parsed.error);
  process.exit(1);
}

const graph = await buildDependencyGraph(parsed.targetDir);
console.log(formatDependencyGraph(graph));
