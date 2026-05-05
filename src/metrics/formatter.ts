import type { AcdResult } from "./acd";

export function formatAcdResult(result: AcdResult): string {
  return [
    "=== ACD ===",
    `Components: ${result.componentCount}`,
    `CCD: ${result.ccd}`,
    `ACD: ${result.acd.toFixed(2)}`,
  ].join("\n");
}
