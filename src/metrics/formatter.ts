import { basename } from "path";
import type { AcdResult } from "./acd";
import type { FanInFanOutResult } from "./fanInFanOut";
import type { PropagationCostResult } from "./propagationCost";

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
