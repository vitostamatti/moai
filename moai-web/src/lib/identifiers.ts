// Shared helpers to convert arbitrary strings into Python-safe identifiers

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
