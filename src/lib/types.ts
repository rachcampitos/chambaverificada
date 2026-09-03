export type RiskLevel = "low" | "medium" | "high";

export interface AnalysisReason {
  text: string;
  /** "positive" = confirms the offer looks legitimate. "warning" = a red-flag signal found. */
  type: "positive" | "warning";
}

export interface AnalysisResult {
  risk: RiskLevel;
  reasons: AnalysisReason[];
}
