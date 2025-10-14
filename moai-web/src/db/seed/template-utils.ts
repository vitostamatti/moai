// Shared helpers for model template seed upserts
// Deterministic stable ID builder so we can safely upsert (same PK every run)
export function makeStableId(modelId: string) {
  return (suffix: string) => `${modelId}::${suffix}`;
}
