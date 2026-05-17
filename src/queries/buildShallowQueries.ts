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
