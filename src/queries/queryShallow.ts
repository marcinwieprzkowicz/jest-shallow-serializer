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

const getNestedValue = (
  obj: Record<string, unknown>,
  key: string
): unknown => {
  if (!key.includes(".")) {
    return obj[key];
  }

  const parts = key.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (
      current === null ||
      typeof current !== "object" ||
      !(part in (current as Record<string, unknown>))
    ) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
};

const matchesProps = (
  elementProps: Record<string, unknown>,
  filterProps: Record<string, unknown>
): boolean => {
  return Object.entries(filterProps).every(([key, filterValue]) => {
    const elementValue = getNestedValue(elementProps, key);
    return elementValue === filterValue;
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
