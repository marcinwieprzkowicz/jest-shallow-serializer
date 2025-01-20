import { jsonReplacer } from "../jsonReplacer";

describe("jsonReplacer", () => {
  it("replaces jest functions with `[MockFunction]`", () => {
    const fn = jest.fn();
    expect(jsonReplacer("key", fn)).toEqual("[MockFunction]");
  });

  it("replaces functions with `[Function]`", () => {
    const fn = () => {};
    expect(jsonReplacer("key", fn)).toBe("[Function]");
  });

  it("keeps non-function values untouched", () => {
    expect(
      jsonReplacer("key", {
        stringProperty: "value",
        numberProperty: 1,
      })
    ).toEqual({ stringProperty: "value", numberProperty: 1 });
  });
});
