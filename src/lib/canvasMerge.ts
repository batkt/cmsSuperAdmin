import { CANVAS_PROPS_KEY } from "./api";

export function mergeCanvasProps(
  props: Record<string, unknown> | undefined,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const base = props && typeof props === "object" ? { ...props } : {};
  const prevCanvas =
    base[CANVAS_PROPS_KEY] && typeof base[CANVAS_PROPS_KEY] === "object"
      ? { ...(base[CANVAS_PROPS_KEY] as Record<string, unknown>) }
      : {};
  return {
    ...base,
    [CANVAS_PROPS_KEY]: { ...prevCanvas, ...patch },
  };
}
