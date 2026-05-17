import { queryAllByShallowName } from "../queryShallow";

const createMockElement = (name: string, props: Record<string, unknown> = {}) => {
  const el = document.createElement("div");
  el.setAttribute("data-shallow-name", name);
  el.setAttribute("data-shallow-props", JSON.stringify(props));
  return el;
};

describe("queryAllByShallowName", () => {
  it("returns empty array when no shallow elements exist", () => {
    const container = document.createElement("div");
    container.innerHTML = "<span>plain element</span>";

    const results = queryAllByShallowName(container, "Button");

    expect(results).toEqual([]);
  });

  it("finds elements by exact name match", () => {
    const container = document.createElement("div");
    container.appendChild(createMockElement("Button", { variant: "primary" }));
    container.appendChild(createMockElement("Input", { type: "text" }));

    const results = queryAllByShallowName(container, "Button");

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Button");
  });

  it("finds elements by regex match", () => {
    const container = document.createElement("div");
    container.appendChild(createMockElement("Button", {}));
    container.appendChild(createMockElement("ButtonGroup", {}));
    container.appendChild(createMockElement("Input", {}));

    const results = queryAllByShallowName(container, /^Button/);

    expect(results).toHaveLength(2);
  });

  it("filters by props option", () => {
    const container = document.createElement("div");
    container.appendChild(createMockElement("Button", { variant: "primary" }));
    container.appendChild(createMockElement("Button", { variant: "secondary" }));

    const results = queryAllByShallowName(container, "Button", {
      props: { variant: "primary" },
    });

    expect(results).toHaveLength(1);
    expect(results[0].props.variant).toBe("primary");
  });

  it("finds elements by predicate function matcher", () => {
    const container = document.createElement("div");
    container.appendChild(createMockElement("Button", {}));
    container.appendChild(createMockElement("Input", {}));

    const isButton = (name: string) => name.startsWith("But");
    const results = queryAllByShallowName(container, isButton);

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Button");
  });

  it("parses props from data-shallow-props attribute", () => {
    const container = document.createElement("div");
    container.appendChild(
      createMockElement("Button", { label: "Click", disabled: true })
    );

    const results = queryAllByShallowName(container, "Button");

    expect(results[0].props).toEqual({ label: "Click", disabled: true });
  });

  it("handles missing data-shallow-props attribute", () => {
    const container = document.createElement("div");
    const el = document.createElement("div");
    el.setAttribute("data-shallow-name", "Button");
    container.appendChild(el);

    const results = queryAllByShallowName(container, "Button");

    expect(results).toHaveLength(1);
    expect(results[0].props).toEqual({});
  });

  it("filters by props partial match", () => {
    const container = document.createElement("div");
    container.appendChild(
      createMockElement("Button", { variant: "primary", size: "lg" })
    );
    container.appendChild(
      createMockElement("Button", { variant: "secondary", size: "sm" })
    );

    const results = queryAllByShallowName(container, "Button", {
      props: { variant: "primary" },
    });

    expect(results).toHaveLength(1);
    expect(results[0].props.size).toBe("lg");
  });

  it("does not match when props filter has no matches", () => {
    const container = document.createElement("div");
    container.appendChild(
      createMockElement("Button", { variant: "primary" })
    );

    const results = queryAllByShallowName(container, "Button", {
      props: { variant: "danger" },
    });

    expect(results).toEqual([]);
  });

  it("matches function props as [Function] string", () => {
    const container = document.createElement("div");
    container.appendChild(
      createMockElement("Button", { onClick: "some handler" })
    );

    const results = queryAllByShallowName(container, "Button", {
      props: { onClick: "[Function]" },
    });

    expect(results).toHaveLength(0);
  });

  it("matches nested props using dot notation", () => {
    const container = document.createElement("div");
    container.appendChild(
      createMockElement("Button", { style: { color: "red", size: "lg" } })
    );
    container.appendChild(
      createMockElement("Button", { style: { color: "blue", size: "sm" } })
    );

    const results = queryAllByShallowName(container, "Button", {
      props: { "style.color": "red" },
    });

    expect(results).toHaveLength(1);
    expect(results[0].props.style).toEqual({ color: "red", size: "lg" });
  });

  it("returns undefined for missing nested props", () => {
    const container = document.createElement("div");
    container.appendChild(
      createMockElement("Button", { variant: "primary" })
    );

    const results = queryAllByShallowName(container, "Button", {
      props: { "style.color": "red" },
    });

    expect(results).toEqual([]);
  });
});
