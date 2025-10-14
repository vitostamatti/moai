import type { VariableSelect } from "@/db/schema";

export type VariableFormData = {
  name: string;
  description?: string;
  domain: VariableSelect["domain"];
  lowerBound?: string;
  upperBound?: string;
  indices?: string[];
};
