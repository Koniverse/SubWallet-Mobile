export type LiteralUnion<T extends string> = T | (string & {});

export const PresetBrandColorTypes = ["primary", "secondary"];
export const PresetStatusColorTypes = ["success", "processing", "error", "default", "warning", "danger"];
export const PresetPositionColorTypes = ["header"];
export const PresetColorTypes = ["pink", "red", "yellow", "orange", "cyan", "green", "blue", "purple", "geekblue", "magenta", "volcano", "gold", "lime"];
export type PresetBrandColorType = typeof PresetBrandColorTypes[number];
export type PresetColorType = typeof PresetColorTypes[number];
export type PresetStatusColorType = typeof PresetStatusColorTypes[number];
export type PresetPositionColorType = typeof PresetPositionColorTypes[number];