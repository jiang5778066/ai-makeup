export function generationMatchesFilter(
  generation: { mode: string; makeupConfig: unknown },
  filter: string
) {
  if (filter === "all") return true;
  if (filter === "full_face") return generation.mode === "full_face";
  if (generation.mode !== "virtual_try_on" || !generation.makeupConfig || typeof generation.makeupConfig !== "object") {
    return false;
  }
  const layer = (generation.makeupConfig as Record<string, unknown>)[filter];
  return Boolean(layer && typeof layer === "object" && (layer as { enabled?: unknown }).enabled === true);
}
