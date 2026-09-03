export type RiskLevel = "low" | "medium" | "high";

export interface AnalysisReason {
  text: string;
  /** "positive" = confirms the offer looks legitimate. "warning" = a red-flag signal found. */
  type: "positive" | "warning";
}

export type CompanyInfo =
  | { found: true; ruc: string; razonSocial: string; estado: string; condicion: string }
  | { found: false; ruc: string };

export interface AnalysisResult {
  risk: RiskLevel;
  reasons: AnalysisReason[];
  /** null when the offer text had no RUC to check, or the SUNAT index isn't
   * synced yet — absence of this field is not itself a warning sign. */
  company: CompanyInfo | null;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
