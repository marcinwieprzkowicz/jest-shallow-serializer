import type { ShallowWrapper } from "./types";

export const shallowed = <T extends object>(source: T): T & ShallowWrapper => {
  return source as T & ShallowWrapper;
};

declare global {
  function shallowed<T extends object>(source: T): T & ShallowWrapper;
}
