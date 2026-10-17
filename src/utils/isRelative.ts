export const isRelative = (source: string) =>
  source.startsWith("./") || source.startsWith("../");
