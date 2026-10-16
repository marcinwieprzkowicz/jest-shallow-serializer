import { isRelative } from "../isRelative";

describe("isRelative", () => {
  describe("when source starts with `./`", () => {
    it("returns true", () => {
      expect(isRelative("./components/Title")).toBe(true);
    });
  });

  describe("when source starts with `../`", () => {
    it("returns true", () => {
      expect(isRelative("../components/Title")).toBe(true);
    });
  });

  describe("when source is a bare specifier", () => {
    it("returns false", () => {
      expect(isRelative("react")).toBe(false);
    });
  });

  describe("when source is a path alias", () => {
    it("returns false", () => {
      expect(isRelative("@/components/TestComponent")).toBe(false);
    });
  });

  describe("when source is absolute", () => {
    it("returns false", () => {
      expect(isRelative("/abs/components/Title")).toBe(false);
    });
  });

  describe("when source is empty", () => {
    it("returns false", () => {
      expect(isRelative("")).toBe(false);
    });
  });
});
