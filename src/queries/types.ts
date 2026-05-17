export type TextMatch = string | RegExp | ((text: string, element: Element | undefined) => boolean);

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
    typeof value === 'string' ||
    value instanceof RegExp ||
    typeof value === 'function'
  );
};

export const matchText = (
  matcher: TextMatch,
  text: string,
  element?: Element,
): boolean => {
  if (typeof matcher === 'string') {
    return text === matcher;
  }

  if (matcher instanceof RegExp) {
    return matcher.test(text);
  }

  return matcher(text, element);
};
