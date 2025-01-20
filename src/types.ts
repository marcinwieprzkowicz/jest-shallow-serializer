import _isPlainObject from "lodash.isplainobject";
import type { MockOptions } from "./shallowWrapper";

export interface ShallowWrapper {
  [key: string]: unknown;
  mock: (name: string, options?: MockOptions) => void;
  unmock: (name: string) => void;
}

export const isNode = (variable: unknown): variable is Node => {
  return variable instanceof Node;
};

export const isPlainObject = (
  value: unknown
): value is Record<string, unknown> => {
  return _isPlainObject(value);
};
