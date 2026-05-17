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
