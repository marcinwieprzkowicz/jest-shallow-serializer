import { getFirstTag } from "../getFirstTag";

describe("getFirstTag", () => {
  it("reads nested components", () => {
    const resolvedPath = require.resolve("./nested1/TestComponent");
    const firstTag = getFirstTag(resolvedPath);

    expect(firstTag).toBe("div");
  });
});
