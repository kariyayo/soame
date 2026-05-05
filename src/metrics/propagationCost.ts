import type { DependencyGraph } from "../graph/builder";
import { calculateAcd } from "./acd";

export type PropagationCostSeverity = "low" | "warning" | "alert";

export type PropagationCostResult = {
  componentCount: number;
  propagationCost: number;
  severity: PropagationCostSeverity;
};

export function calculatePropagationCost(graph: DependencyGraph): PropagationCostResult {
  const acd = calculateAcd(graph);
  const n = acd.componentCount;
  if (n === 0) {
    return { componentCount: 0, propagationCost: 0, severity: "low" };
  }
  const propagationCost = acd.acd / n;
  return { componentCount: n, propagationCost, severity: judgeSeverity(n, propagationCost) };
}

function judgeSeverity(n: number, pc: number): PropagationCostSeverity {
  if (n < 500) return "low";
  if (n < 5000) {
    if (pc >= 0.5) return "alert";
    if (pc >= 0.2) return "warning";
    return "low";
  }
  if (pc >= 0.1) return "warning";
  return "low";
}
