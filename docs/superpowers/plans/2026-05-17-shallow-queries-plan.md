# Shallow Queries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Testing Library-style query API for finding shallow-rendered components by name with props filtering.

**Architecture:** DOM-based queries using `querySelectorAll('[data-shallow-name]')`, following Testing Library's buildQueries pattern with 6 query variants (get/query/find × single/all). Global queries pre-bound to document.body, query module exportable for use with `within`.

**Tech Stack:** TypeScript (strict mode), Jest, @testing-library/dom, jsdom

---

### Task 1: Define Query Types

**Files:**
- Create: `src/queries/types.ts`
- Test: `src/queries/__tests__/types.spec.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/queries/__tests__/types.spec.ts
import { isTextMatch, matchText } from "../types";

describe("types", () => {
  describe("isTextMatch", () => {
    it("returns true for string", () => {
      expect(isTextMatch("Button")).toBe(true);
    });

    it("returns true for RegExp", () => {
      expect(isTextMatch(/Button/)).toBe(true);
    });

    it("returns true for function", () => {
      expect(isTextMatch(() => true)).toBe(true);
    });

    it("returns false for null", () => {
      expect(isTextMatch(null)).toBe(false);
    });

    it("returns false for undefined", () => {
      expect(isTextMatch(undefined)).toBe(false);
    });
  });

  describe("matchText", () => {
    it("matches exact string", () => {
      expect(matchText("Button", "Button")).toBe(true);
    });

    it("does not match different string", () => {
      expect(matchText("Button", "Input")).toBe(false);
    });

    it("matches regex pattern", () => {
      expect(matchText(/but/i, "Button")).toBe(true);
    });

    it("does not match non-matching regex", () => {
      expect(matchText(/input/i, "Button")).toBe(false);
    });

    it("calls predicate function", () => {
      const predicate = (text: string) => text.startsWith("But");
      expect(matchText(predicate, "Button")).toBe(true);
    });

    it("returns false when predicate returns false", () => {
      const predicate = (text: string) => text.startsWith("In");
      expect(matchText(predicate, "Button")).toBe(false);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/queries/__tests__/types.spec.ts -v`
Expected: FAIL with module not found

- [ ] **Step 3: Write types and utility functions**

```typescript
// src/queries/types.ts
export type TextMatch = string | RegExp | ((text: string, element: Element) => boolean);

export interface ShallowQueryOptions {
  props?: Record<string, unknown>;
}

export interface ShallowQueryResult {
  name: string;
  props: Record<string, unknown>;
  element: Element;
}

export const isTextMatch = (value: unknown): value is TextMatch => {
  return (
    typeof value === "string" ||
    value instanceof RegExp ||
    typeof value === "function"
  );
};

export const matchText = (
  matcher: TextMatch,
  text: string,
  element?: Element
): boolean => {
  if (typeof matcher === "string") {
    return text === matcher;
  }

  if (matcher instanceof RegExp) {
    return matcher.test(text);
  }

  return matcher(text, element!);
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/queries/__tests__/types.spec.ts -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/queries/types.ts src/queries/__tests__/types.spec.ts
git commit -m "feat: add query types and TextMatch utilities"
```

---

### Task 2: Base Query Function

**Files:**
- Create: `src/queries/queryShallow.ts`
- Test: `src/queries/__tests__/queryShallow.spec.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/queries/__tests__/queryShallow.spec.ts
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

  it("finds elements by predicate function", () => {
    const container = document.createElement("div");
    container.appendChild(createMockElement("Button", { variant: "primary" }));
    container.appendChild(createMockElement("Button", { variant: "secondary" }));

    const results = queryAllByShallowName(container, "Button", {
      props: { variant: "primary" },
    });

    expect(results).toHaveLength(1);
    expect(results[0].props.variant).toBe("primary");
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/queries/__tests__/queryShallow.spec.ts -v`
Expected: FAIL with module not found

- [ ] **Step 3: Write base query function**

```typescript
// src/queries/queryShallow.ts
import type { ShallowQueryOptions, ShallowQueryResult, TextMatch } from "./types";
import { matchText } from "./types";

const parseShallowProps = (element: Element): Record<string, unknown> => {
  const propsAttr = element.getAttribute("data-shallow-props");
  if (!propsAttr) return {};
  try {
    return JSON.parse(propsAttr);
  } catch {
    return {};
  }
};

const matchesProps = (
  elementProps: Record<string, unknown>,
  filterProps: Record<string, unknown>
): boolean => {
  return Object.entries(filterProps).every(([key, value]) => {
    return elementProps[key] === value;
  });
};

export const queryAllByShallowName = (
  container: HTMLElement | Document,
  name: TextMatch,
  options: ShallowQueryOptions = {}
): ShallowQueryResult[] => {
  const elements = container.querySelectorAll("[data-shallow-name]");
  const results: ShallowQueryResult[] = [];

  elements.forEach((element) => {
    const elementName = element.getAttribute("data-shallow-name") || "";

    if (!matchText(name, elementName, element)) {
      return;
    }

    const elementProps = parseShallowProps(element);

    if (options.props && !matchesProps(elementProps, options.props)) {
      return;
    }

    results.push({
      name: elementName,
      props: elementProps,
      element,
    });
  });

  return results;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/queries/__tests__/queryShallow.spec.ts -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/queries/queryShallow.ts src/queries/__tests__/queryShallow.spec.ts
git commit -m "feat: add queryAllByShallowName base query function"
```

---

### Task 3: Build Query Variants

**Files:**
- Create: `src/queries/buildShallowQueries.ts`
- Test: `src/queries/__tests__/buildShallowQueries.spec.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/queries/__tests__/buildShallowQueries.spec.ts
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

    it("throws when multiple elements found", () => {
      const container = document.createElement("div");
      container.appendChild(createMockElement("Button"));
      container.appendChild(createMockElement("Button"));

      expect(() =>
        queries.queryByShallowName(container, "Button")
      ).toThrow(/found multiple elements with shallow name/i);
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/queries/__tests__/buildShallowQueries.spec.ts -v`
Expected: FAIL with module not found

- [ ] **Step 3: Write buildShallowQueries**

```typescript
// src/queries/buildShallowQueries.ts
import type { ShallowQueryOptions, ShallowQueryResult, TextMatch } from "./types";

type QueryAll = (
  container: HTMLElement | Document,
  name: TextMatch,
  options?: ShallowQueryOptions
) => ShallowQueryResult[];

const getElementError = (message: string, container: HTMLElement | Document): Error => {
  const error = new Error(message);
  error.name = "TestingLibraryElementError";
  return error;
};

export const buildShallowQueries = (queryAll: QueryAll) => {
  const getAllByShallowName = (
    container: HTMLElement | Document,
    name: TextMatch,
    options?: ShallowQueryOptions
  ): ShallowQueryResult[] => {
    const results = queryAll(container, name, options);
    if (results.length === 0) {
      throw getElementError(
        `Unable to find an element with shallow name: ${String(name)}`,
        container
      );
    }
    return results;
  };

  const getByShallowName = (
    container: HTMLElement | Document,
    name: TextMatch,
    options?: ShallowQueryOptions
  ): ShallowQueryResult => {
    const results = getAllByShallowName(container, name, options);
    if (results.length > 1) {
      throw getElementError(
        `Found multiple elements with shallow name: ${String(name)}`,
        container
      );
    }
    return results[0];
  };

  const queryByShallowName = (
    container: HTMLElement | Document,
    name: TextMatch,
    options?: ShallowQueryOptions
  ): ShallowQueryResult | null => {
    const results = queryAll(container, name, options);
    if (results.length > 1) {
      throw getElementError(
        `Found multiple elements with shallow name: ${String(name)}`,
        container
      );
    }
    return results[0] ?? null;
  };

  const queryAllByShallowName = (
    container: HTMLElement | Document,
    name: TextMatch,
    options?: ShallowQueryOptions
  ): ShallowQueryResult[] => {
    return queryAll(container, name, options);
  };

  return {
    getAllByShallowName,
    getByShallowName,
    queryByShallowName,
    queryAllByShallowName,
  };
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/queries/__tests__/buildShallowQueries.spec.ts -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/queries/buildShallowQueries.ts src/queries/__tests__/buildShallowQueries.spec.ts
git commit -m "feat: add buildShallowQueries for query variants"
```

---

### Task 3b: Add Async Query Variants (findBy)

**Files:**
- Modify: `src/queries/buildShallowQueries.ts`
- Test: `src/queries/__tests__/buildShallowQueries.spec.ts` (append to existing)

- [ ] **Step 1: Add async query tests**

Append to `src/queries/__tests__/buildShallowQueries.spec.ts`:

```typescript
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

    it("throws after timeout when no elements found", async () => {
      const container = document.createElement("div");

      await expect(
        queries.findAllByShallowName(container, "Button", {}, { timeout: 50 })
      ).rejects.toThrow(/unable to find an element with shallow name/i);
    });
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/queries/__tests__/buildShallowQueries.spec.ts -v`
Expected: FAIL - findByShallowName and findAllByShallowName not defined

- [ ] **Step 3: Add async query implementations**

Add to `src/queries/buildShallowQueries.ts`:

```typescript
import { waitFor } from "@testing-library/dom";
import type { waitForOptions } from "@testing-library/dom/types/wait-for";

// Add to buildShallowQueries, after existing functions:

  const findByShallowName = async (
    container: HTMLElement | Document,
    name: TextMatch,
    options?: ShallowQueryOptions,
    waitForOpts?: waitForOptions
  ): Promise<ShallowQueryResult> => {
    let result: ShallowQueryResult | null = null;
    await waitFor(
      () => {
        const results = queryAll(container, name, options);
        if (results.length > 1) {
          throw getElementError(
            `Found multiple elements with shallow name: ${String(name)}`,
            container
          );
        }
        if (results.length === 0) {
          throw getElementError(
            `Unable to find an element with shallow name: ${String(name)}`,
            container
          );
        }
        result = results[0];
      },
      waitForOpts
    );
    return result!;
  };

  const findAllByShallowName = async (
    container: HTMLElement | Document,
    name: TextMatch,
    options?: ShallowQueryOptions,
    waitForOpts?: waitForOptions
  ): Promise<ShallowQueryResult[]> => {
    let results: ShallowQueryResult[] = [];
    await waitFor(
      () => {
        results = queryAll(container, name, options);
        if (results.length === 0) {
          throw getElementError(
            `Unable to find an element with shallow name: ${String(name)}`,
            container
          );
        }
      },
      waitForOpts
    );
    return results;
  };

  return {
    getAllByShallowName,
    getByShallowName,
    queryByShallowName,
    queryAllByShallowName,
    findByShallowName,
    findAllByShallowName,
  };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/queries/__tests__/buildShallowQueries.spec.ts -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/queries/buildShallowQueries.ts src/queries/__tests__/buildShallowQueries.spec.ts
git commit -m "feat: add findByShallowName and findAllByShallowName async queries"
```

---

### Task 4: Global Queries & Module Exports

**Files:**
- Create: `src/queries/index.ts`
- Modify: `src/index.ts`
- Modify: `package.json`

- [ ] **Step 1: Create queries module exports**

```typescript
// src/queries/index.ts
export type { ShallowQueryResult, ShallowQueryOptions, TextMatch } from "./types";
export { queryAllByShallowName } from "./queryShallow";
export { buildShallowQueries } from "./buildShallowQueries";

import { queryAllByShallowName } from "./queryShallow";
import { buildShallowQueries } from "./buildShallowQueries";

const queries = buildShallowQueries(queryAllByShallowName);

export const {
  getAllByShallowName,
  getByShallowName,
  queryByShallowName,
  queryAllByShallowName,
  findByShallowName,
  findAllByShallowName,
} = queries;
```

- [ ] **Step 2: Add global queries to main entry point**

Read `src/index.ts` and update:

```typescript
// src/index.ts
export { doShallow } from "./doShallow";
export { shallowed } from "./shallowed";
export { shallowWrapper } from "./shallowWrapper";
export type { ShallowWrapper } from "./types";

export {
  getByShallowName,
  getAllByShallowName,
  queryByShallowName,
  queryAllByShallowName,
  findByShallowName,
  findAllByShallowName,
} from "./queries";
export type { ShallowQueryResult, ShallowQueryOptions, TextMatch } from "./queries";
```

- [ ] **Step 3: Add queries export to package.json**

Read `package.json` and add to exports:

```json
"./queries": {
  "types": "./dist/queries/index.d.ts",
  "default": "./dist/queries/index.js"
}
```

- [ ] **Step 4: Build and verify**

Run: `npm run build`
Expected: SUCCESS, no TypeScript errors

- [ ] **Step 5: Commit**

```bash
git add src/queries/index.ts src/index.ts package.json
git commit -m "feat: export query functions from main and queries entry points"
```

---

### Task 5: Integration Tests with Testing Library within

**Files:**
- Create: `src/queries/__tests__/integration.spec.tsx`

- [ ] **Step 1: Write integration test**

```typescript
// src/queries/__tests__/integration.spec.tsx
import React from "react";
import { render } from "@testing-library/react";
import { within } from "@testing-library/dom";
import { shallowWrapper } from "../../shallowWrapper";
import * as shallowQueries from "../index";

describe("shallow queries integration", () => {
  it("works with global getByShallowName", () => {
    const wrapper = shallowWrapper(
      "./__tests__/__fixtures__/TestComponent.tsx",
      "TestComponent"
    )();
    wrapper.mock("TestComponent");

    const TestComponent = wrapper.TestComponent as React.ComponentType<{
      prop?: string;
      children?: React.ReactNode;
    }>;

    const { asFragment } = render(
      <TestComponent prop="lorem ipsum">children</TestComponent>
    );

    const result = shallowQueries.getByShallowName(
      asFragment().firstChild as HTMLElement,
      "TestComponent"
    );

    expect(result.name).toBe("TestComponent");
    expect(result.props.prop).toBe("lorem ipsum");

    wrapper.unmock("TestComponent");
  });

  it("works with within from @testing-library/dom", () => {
    const wrapper = shallowWrapper(
      "./__tests__/__fixtures__/TestComponent.tsx",
      "TestComponent"
    )();
    wrapper.mock("TestComponent");

    const TestComponent = wrapper.TestComponent as React.ComponentType<{
      prop?: string;
      children?: React.ReactNode;
    }>;

    const { asFragment } = render(
      <TestComponent prop="lorem ipsum">children</TestComponent>
    );

    const container = asFragment().firstChild as HTMLElement;
    const scoped = within(container, { queries: shallowQueries });
    const result = scoped.getByShallowName("TestComponent");

    expect(result.name).toBe("TestComponent");

    wrapper.unmock("TestComponent");
  });

  it("supports props filtering with within", () => {
    const wrapper = shallowWrapper(
      "./__tests__/__fixtures__/TestComponent.tsx",
      "TestComponent"
    )();
    wrapper.mock("TestComponent");

    const TestComponent = wrapper.TestComponent as React.ComponentType<{
      prop?: string;
      children?: React.ReactNode;
    }>;

    const { asFragment } = render(
      <>
        <TestComponent prop="first">first</TestComponent>
        <TestComponent prop="second">second</TestComponent>
      </>
    );

    const container = asFragment().firstChild as HTMLElement;
    const scoped = within(container, { queries: shallowQueries });

    const results = scoped.queryAllByShallowName("TestComponent", {
      props: { prop: "first" },
    });

    expect(results).toHaveLength(1);
    expect(results[0].props.prop).toBe("first");

    wrapper.unmock("TestComponent");
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npx jest src/queries/__tests__/integration.spec.tsx -v`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/queries/__tests__/integration.spec.tsx
git commit -m "test: add integration tests with @testing-library/dom within"
```

---

### Task 6: Run Full Test Suite & Type Check

- [ ] **Step 1: Run full test suite**

Run: `npm run test`
Expected: All tests pass, TypeScript type check succeeds

- [ ] **Step 2: Fix any issues**

If any tests fail or type errors occur, fix them and commit:

```bash
git add -A
git commit -m "fix: address test failures and type errors"
```
