import { parseArgs } from "./cli";
import { buildDependencyGraph } from "./graph/builder";
import { formatDependencyGraph } from "./graph/formatter";
import { calculateAcd } from "./metrics/acd";
import { calculateFanInFanOut } from "./metrics/fanInFanOut";
import { calculatePropagationCost } from "./metrics/propagationCost";
import { calculateLcom4, type Lcom4Result } from "./metrics/lcom4";
import { formatAcdResult, formatFanInFanOutResult, formatPropagationCostResult, formatLcom4Result } from "./metrics/formatter";
import { scanKotlinFiles } from "./parser/kotlin/scanner";
import { readFile } from "fs/promises";

const args = process.argv.slice(2);
const parsed = parseArgs(args);

if (parsed.error) {
  console.error(parsed.error);
  process.exit(1);
}

if (!parsed.targetDir) {
  console.error("targetDir is undefined or null")
  process.exit(1);
}

if (parsed.showLcom4) {
  const lcom4 = await calculateLcom4(parsed.targetDir);
  console.log(formatLcom4Result(lcom4));
  process.exit(0);
}

const graph = await buildDependencyGraph(parsed.targetDir);

if (parsed.showGraph) {
  console.log(formatDependencyGraph(graph));
} else if (parsed.showAcd) {
  console.log(formatAcdResult(calculateAcd(graph)));
} else if (parsed.showFanInFanOut) {
  console.log(formatFanInFanOutResult(calculateFanInFanOut(graph)));
} else {
  console.log(formatPropagationCostResult(calculatePropagationCost(graph)));
}
