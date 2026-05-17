import { basename } from "path";
import type { AcdResult } from "./acd";
import type { FanInFanOutResult } from "./fanInFanOut";
import type { PropagationCostResult } from "./propagationCost";
import type { Lcom4Result } from "./lcom4";

export function formatAcdResult(result: AcdResult): string {
  return [
    "=== ACD ===",
    `Components: ${result.componentCount}`,
    `CCD: ${result.ccd}`,
    `ACD: ${result.acd.toFixed(2)}`,
  ].join("\n");
}

export function formatFanInFanOutResult(result: FanInFanOutResult): string {
  const header = `=== Fan-in / Fan-out ===\nComponents: ${result.componentCount}\n`;

  if (result.entries.length === 0) return header.trimEnd();

  const sorted = [...result.entries].sort((a, b) =>
    a.packageName.localeCompare(b.packageName)
  );

  const labelOf = (e: (typeof sorted)[0]) => `${e.packageName} (${basename(e.filePath)})`;
  const colWidth = Math.max(...sorted.map((e) => labelOf(e).length), 10);
  const titleRow = `${"Package (File)".padEnd(colWidth)}  Fan-in   Fan-out`;
  const separator = "-".repeat(colWidth + 18);
  const rows = sorted.map(
    (e) =>
      `${labelOf(e).padEnd(colWidth)}  ${e.fanIn.toFixed(3)}    ${e.fanOut.toFixed(3)}`
  );

  return [header + titleRow, separator, ...rows].join("\n");
}

const severityMessages: Record<PropagationCostResult["severity"], string> = {
  low: "low",
  warning: "warning (注意が必要です)",
  alert: "alert (深刻な問題の可能性があります)",
};

export function formatPropagationCostResult(result: PropagationCostResult): string {
  const pct = (result.propagationCost * 100).toFixed(2) + "%";
  return [
    "=== Propagation Cost ===",
    `Components: ${result.componentCount}`,
    `Propagation Cost: ${pct}`,
    `Severity: ${severityMessages[result.severity]}`,
  ].join("\n");
}

export function formatLcom4Result(results: Lcom4Result[]): string {
  const header = "=== LCOM4 (Lack of Cohesion in Methods 4) ===\n";
  if (results.length === 0) return header + "(no classes found)";

  const rows: string[] = [];
  results.forEach((res) => {
    res.classes.forEach((cls) => {
      rows.push(`${basename(res.filePath)}: ${cls.className.padEnd(20)} LCOM4 = ${cls.lcom4}`);
    });
  });

  const totalLcom4 = results.reduce((sum, res) => sum + res.classes.reduce((s, c) => s + c.lcom4, 0), 0);
  const totalClasses = results.reduce((sum, res) => sum + res.classes.length, 0);
  const average = totalClasses > 0 ? (totalLcom4 / totalClasses).toFixed(2) : "0.00";

  return [header, ...rows, "---", `Average LCOM4: ${average}`].join("\n");
}
