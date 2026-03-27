export interface StructuredError {
  code: string;
  reason: string;
  remediation: string;
}

export interface ApiResponse<T> {
  entity: T;
  constraints: Record<string, boolean | string | number>;
  nextActions: string[];
}

export interface ErrorResponse {
  error: StructuredError;
}

export interface Actor {
  type: "human" | "agent" | "system";
  id: string;
  humanPrincipal?: string;
}
