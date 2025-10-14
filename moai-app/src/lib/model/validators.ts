// Shared helpers to convert arbitrary strings into Python-safe identifiers

import {
  type Constraint,
  type Model,
  type Objective,
  type Parameter,
  type Set,
  type Variable,
} from "./types";

export const pythonKeywords = new Set<string>([
  "False",
  "None",
  "True",
  "and",
  "as",
  "assert",
  "async",
  "await",
  "break",
  "class",
  "continue",
  "def",
  "del",
  "elif",
  "else",
  "except",
  "finally",
  "for",
  "from",
  "global",
  "if",
  "import",
  "in",
  "is",
  "lambda",
  "nonlocal",
  "not",
  "or",
  "pass",
  "raise",
  "return",
  "try",
  "while",
  "with",
  "yield",
  "match",
  "case",
]);

// Converts arbitrary strings into valid Python identifiers
export function toPythonIdentifier(raw: string): string {
  // Replace non-word characters with underscore
  const replaced = raw.replace(/\W+/g, "_");
  // Ensure it starts with a letter or underscore
  const prefixed = /^[A-Za-z_]/.test(replaced) ? replaced : `_${replaced}`;
  // Normalize leading/trailing runs of underscores
  const trimmed = prefixed.replace(/^_+|_+$/g, "_");
  // Avoid Python keywords by suffixing underscore
  return pythonKeywords.has(trimmed) ? `${trimmed}_` : trimmed;
}

// validate set
type ModelValidationError = {
  field: string;
  message: string;
};

function validateIdentifier(id: string): boolean {
  // Valid Python identifier: starts with letter or underscore, followed by letters, digits, underscores
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(id) && !pythonKeywords.has(id);
}

export function validateSet(model: Model, set: Set): ModelValidationError[] {
  // validate name is a valid identifier
  const errors = [];
  if (!validateIdentifier(set.name)) {
    errors.push({ field: "name", message: "Invalid set name" });
  }
  // check if elements are unique
  if (set.elements.length !== new Set(set.elements.map(String)).size) {
    errors.push({ field: "elements", message: "Set elements must be unique" });
  }

  return errors;
}

// validate variable
export function validateVariable(
  model: Model,
  variable: Variable
): ModelValidationError[] {
  const errors = [];
  if (!validateIdentifier(variable.name)) {
    errors.push({ field: "name", message: "Invalid variable name" });
  }
  // check that indices is a valid set name
  const setNames = new Set(model.sets?.map((s) => s.name) || []);
  for (const index of variable.indices) {
    if (!setNames.has(index)) {
      errors.push({
        field: "indices",
        message: `Index "${index}" does not correspond to any defined set`,
      });
    }
  }

  // check that lowerBound < upperBound if both defined
  if (
    variable.lowerBound !== undefined &&
    variable.upperBound !== undefined &&
    variable.lowerBound >= variable.upperBound
  ) {
    errors.push({
      field: "bounds",
      message: "Variable lowerBound must be less than upperBound",
    });
  }
  return errors;
}

// validate parameter
export function validateParameter(
  model: Model,
  parameter: Parameter
): ModelValidationError[] {
  const errors = [];
  // validate name is a valid identifier
  if (!validateIdentifier(parameter.name)) {
    errors.push({ field: "name", message: "Invalid parameter name" });
  }
  // check that indices is a valid set name
  const setNames = new Set(model.sets?.map((s) => s.name) || []);
  for (const index of parameter.indices) {
    if (!setNames.has(index)) {
      errors.push({
        field: "indices",
        message: `Index "${index}" does not correspond to any defined set`,
      });
    }
  }
  // validate that len of indices is consistent with values
  if (Array.isArray(parameter.values)) {
    for (const pv of parameter.values) {
      if (pv.index.length !== parameter.indices.length) {
        errors.push({
          field: "values",
          message: `Parameter value index length ${pv.index.length} does not match parameter indices length ${parameter.indices.length}`,
        });
      }
    }
  } else if (parameter.indices.length > 0) {
    errors.push({
      field: "values",
      message: `Parameter values must be an array when indices are defined`,
    });
  }
  // validate that values.index correspond to defined elements in sets
  const setsMap = new Map<string, Set>();
  for (const s of model.sets || []) {
    setsMap.set(s.name, s);
  }
  if (Array.isArray(parameter.values)) {
    for (const pv of parameter.values) {
      pv.index.forEach((idx, i) => {
        const setName = parameter.indices[i];
        const set = setsMap.get(setName);
        if (set && !set.elements.map(String).includes(String(idx))) {
          errors.push({
            field: "values",
            message: `Parameter value index "${idx}" not found in set "${setName}"`,
          });
        }
      });
    }
  }
  return errors;
}

// validate constraint
export function validateConstraint(
  model: Model,
  constraint: Constraint
): ModelValidationError[] {
  return [];
}

// validate objective
export function validateObjective(
  model: Model,
  objective: Objective
): ModelValidationError[] {
  return [];
}
