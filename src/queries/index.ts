export type { ShallowQueryResult, ShallowQueryOptions, TextMatch } from "./types";
export { buildShallowQueries } from "./buildShallowQueries";

import type { ShallowQueryOptions, ShallowQueryResult, TextMatch } from "./types";
import { queryAllByShallowName as queryAllByShallowNameBase } from "./queryShallow";
import { buildShallowQueries } from "./buildShallowQueries";

const queries = buildShallowQueries(queryAllByShallowNameBase);

export const {
  getAllByShallowName,
  getByShallowName,
  queryByShallowName,
  queryAllByShallowName,
  findByShallowName,
  findAllByShallowName,
} = queries;

export { queries as shallowQueries };

const queryAllOnBody = (
  _container: HTMLElement | Document,
  name: TextMatch,
  options?: ShallowQueryOptions
): ShallowQueryResult[] => {
  return queryAllByShallowNameBase(document.body, name, options);
};

const screenQueries = buildShallowQueries(queryAllOnBody);

export const screen = {
  getAllByShallowName: (name: TextMatch, options?: ShallowQueryOptions) =>
    screenQueries.getAllByShallowName(document.body, name, options),
  getByShallowName: (name: TextMatch, options?: ShallowQueryOptions) =>
    screenQueries.getByShallowName(document.body, name, options),
  queryByShallowName: (name: TextMatch, options?: ShallowQueryOptions) =>
    screenQueries.queryByShallowName(document.body, name, options),
  queryAllByShallowName: (name: TextMatch, options?: ShallowQueryOptions) =>
    screenQueries.queryAllByShallowName(document.body, name, options),
  findByShallowName: (
    name: TextMatch,
    options?: ShallowQueryOptions,
    waitForOpts?: Parameters<typeof screenQueries.findByShallowName>[3]
  ) => screenQueries.findByShallowName(document.body, name, options, waitForOpts),
  findAllByShallowName: (
    name: TextMatch,
    options?: ShallowQueryOptions,
    waitForOpts?: Parameters<typeof screenQueries.findAllByShallowName>[3]
  ) => screenQueries.findAllByShallowName(document.body, name, options, waitForOpts),
};
