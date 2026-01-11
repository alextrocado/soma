
export interface Problem {
  num1: number;
  num2: number;
}

export interface UserInput {
  row1D: string;
  row1U: string;
  row2D: string;
  row2U: string;
  carry: string;
  resultD: string;
  resultU: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  fieldErrors: Partial<Record<keyof UserInput, boolean>>;
}
