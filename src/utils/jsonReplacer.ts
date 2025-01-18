import type { EntryProcessor } from "json-stringify-safe";
import isFunction from "lodash.isfunction";

export const jsonReplacer: EntryProcessor = (_, value) => {
  if (isFunction(value)) {
    if ("_isMockFunction" in value) {
      return "[MockFunction]";
    }
    return "[Function]";
  }

  return value;
};
