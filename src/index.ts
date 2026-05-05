import { parseArgs } from "./cli";
import { buildDependencyGraph } from "./graph/builder";
import { formatDependencyGraph } from "./graph/formatter";
import { calculateAcd } from "./metrics/acd";
import { calculateFanInFanOut } from "./metrics/fanInFanOut";
import { formatAcdResult, formatFanInFanOutResult } from "./metrics/formatter";

const args = process.argv.slice(2);
const parsed = parseArgs(args);

if (parsed.error) {
  console.error(parsed.error);
  process.exit(1);
}

const graph = await buildDependencyGraph(parsed.targetDir);

if (parsed.showGraph) {
  console.log(formatDependencyGraph(graph));
} else if (parsed.showAcd) {
  const acdResult = calculateAcd(graph);
  console.log(formatAcdResult(acdResult));
} else {
  const fanResult = calculateFanInFanOut(graph);
  console.log(formatFanInFanOutResult(fanResult));
}
