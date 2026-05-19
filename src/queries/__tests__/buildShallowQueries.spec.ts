import { buildShallowQueries } from "../buildShallowQueries";
import { queryAllByShallowName } from "../queryShallow";

const createMockElement = (name: string, props: Record<string, unknown> = {}) => {
  const el = document.createElement("div");
  el.setAttribute("data-shallow-name", name);
  el.setAttribute("data-shallow-props", JSON.stringify(props));
  return el;
};

describe("buildShallowQueries", () => {
  let queries: ReturnType<typeof buildShallowQueries>;

  beforeEach(() => {
    queries = buildShallowQueries(queryAllByShallowName);
  });

  describe("getAllByShallowName", () => {
    it("returns array when elements found", () => {
      const container = document.createElement("div");
      container.appendChild(createMockElement("Button"));
      container.appendChild(createMockElement("Button"));

      const results = queries.getAllByShallowName(container, "Button");

      expect(results).toHaveLength(2);
    });

    it("throws when no elements found", () => {
      const container = document.createElement("div");

      expect(() =>
        queries.getAllByShallowName(container, "Button")
      ).toThrow(/unable to find an element with shallow name/i);
    });
  });

  describe("getByShallowName", () => {
    it("returns single element when one found", () => {
      const container = document.createElement("div");
      container.appendChild(createMockElement("Button"));

      const result = queries.getByShallowName(container, "Button");

      expect(result.name).toBe("Button");
    });

    it("throws when no elements found", () => {
      const container = document.createElement("div");

      expect(() =>
        queries.getByShallowName(container, "Button")
      ).toThrow(/unable to find an element with shallow name/i);
    });

    it("throws when multiple elements found", () => {
      const container = document.createElement("div");
      container.appendChild(createMockElement("Button"));
      container.appendChild(createMockElement("Button"));

      expect(() =>
        queries.getByShallowName(container, "Button")
      ).toThrow(/found multiple elements with shallow name/i);
    });
  });

  describe("queryByShallowName", () => {
    it("returns single element when one found", () => {
      const container = document.createElement("div");
      container.appendChild(createMockElement("Button"));

      const result = queries.queryByShallowName(container, "Button");

      expect(result?.name).toBe("Button");
    });

    it("returns null when no elements found", () => {
      const container = document.createElement("div");

      const result = queries.queryByShallowName(container, "Button");

      expect(result).toBeNull();
    });

    it("returns first element when multiple found (does not throw)", () => {
      const container = document.createElement("div");
      container.appendChild(createMockElement("Button"));
      container.appendChild(createMockElement("Button"));

      const result = queries.queryByShallowName(container, "Button");

      expect(result?.name).toBe("Button");
    });
  });

  describe("queryAllByShallowName", () => {
    it("returns array when elements found", () => {
      const container = document.createElement("div");
      container.appendChild(createMockElement("Button"));

      const results = queries.queryAllByShallowName(container, "Button");

      expect(results).toHaveLength(1);
    });

    it("returns empty array when no elements found", () => {
      const container = document.createElement("div");

      const results = queries.queryAllByShallowName(container, "Button");

      expect(results).toEqual([]);
    });
  });

  describe("findByShallowName", () => {
    it("returns element when already present", async () => {
      const container = document.createElement("div");
      container.appendChild(createMockElement("Button"));

      const result = await queries.findByShallowName(container, "Button");

      expect(result.name).toBe("Button");
    });

    it("throws after timeout when element not found", async () => {
      const container = document.createElement("div");

      await expect(
        queries.findByShallowName(container, "Button", {}, { timeout: 50 })
      ).rejects.toThrow(/unable to find an element with shallow name/i);
    });

    it("throws when multiple elements found", async () => {
      const container = document.createElement("div");
      container.appendChild(createMockElement("Button"));
      container.appendChild(createMockElement("Button"));

      await expect(
        queries.findByShallowName(container, "Button")
      ).rejects.toThrow(/found multiple elements with shallow name/i);
    });
  });

  describe("findAllByShallowName", () => {
    it("returns array when elements already present", async () => {
      const container = document.createElement("div");
      container.appendChild(createMockElement("Button"));

      const results = await queries.findAllByShallowName(container, "Button");

      expect(results).toHaveLength(1);
    });

    it("returns all matching elements when multiple found (final results)", async () => {
      const container = document.createElement("div");
      container.appendChild(createMockElement("Button"));
      container.appendChild(createMockElement("Button"));
      container.appendChild(createMockElement("Input"));

      const results = await queries.findAllByShallowName(container, "Button");

      expect(results).toHaveLength(2);
    });

    it("throws after timeout when no elements found", async () => {
      const container = document.createElement("div");

      await expect(
        queries.findAllByShallowName(container, "Button", {}, { timeout: 50 })
      ).rejects.toThrow(/unable to find an element with shallow name/i);
    });
  });

  describe("findByShallowName with waitFor options", () => {
    it("respects interval option for dynamic content", async () => {
      const container = document.createElement("div");
      const promise = new Promise<void>((resolve) => {
        setTimeout(() => {
          container.appendChild(createMockElement("AsyncButton", {}));
          resolve();
        }, 30);
      });

      const result = await queries.findByShallowName(container, "AsyncButton", {}, { interval: 5 });

      expect(result.name).toBe("AsyncButton");
      await promise;
    });
  });
});
