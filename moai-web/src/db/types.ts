// Type-only helpers for UI components to work with DB shapes.
// These imports are type-only to stay safe in client components.
import type {
  ModelSelect,
  SetSelect,
  ParameterSelect,
  VariableSelect,
  ConstraintSelect,
  ObjectiveSelect,
  UserSelect,
} from "@/db/schema";

export type ModelWithComponents = ModelSelect & {
  user?: UserSelect | null;
  // organization is not used in the current UI components; add if needed later
  sets: SetSelect[];
  parameters: ParameterSelect[];
  variables: VariableSelect[];
  constraints: ConstraintSelect[];
  objectives: ObjectiveSelect[];
};
