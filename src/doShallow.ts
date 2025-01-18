import type { ShallowWrapper } from "./types";

export const doShallow = (
  modulePath: string,
  componentName: string
): ShallowWrapper => {
  jest.doMock(modulePath, shallowWrapper(modulePath, componentName));
  return require(modulePath);
};

declare global {
  function doShallow(modulePath: string, componentName: string): ShallowWrapper;
}
