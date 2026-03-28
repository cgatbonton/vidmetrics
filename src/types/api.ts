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

export interface SaveResult<T> {
  entity: T | null;
  error: StructuredError | null;
  nextActions: string[];
}

export interface Actor {
  type: "human" | "agent" | "system";
  id: string;
  humanPrincipal?: string;
}
