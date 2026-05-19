export type {
  ShallowQueryResult,
  ShallowQueryOptions,
  TextMatch,
} from "./types";
export { buildShallowQueries } from "./buildShallowQueries";

import type {
  ShallowQueryOptions,
  ShallowQueryResult,
  TextMatch,
} from "./types";
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

// Global screen (always body, but evaluated at runtime).
// Re-uses the same queries object, bound to document.body for each call.

const {
  getAllByShallowName: sGetAll,
  getByShallowName: sGet,
  queryByShallowName: sQuery,
  queryAllByShallowName: sQueryAll,
  findByShallowName: sFind,
  findAllByShallowName: sFindAll,
} = queries;

export const screen = {
  getAllByShallowName: (name: TextMatch, options?: ShallowQueryOptions) =>
    sGetAll(document.body, name, options),
  getByShallowName: (name: TextMatch, options?: ShallowQueryOptions) =>
    sGet(document.body, name, options),
  queryByShallowName: (name: TextMatch, options?: ShallowQueryOptions) =>
    sQuery(document.body, name, options),
  queryAllByShallowName: (name: TextMatch, options?: ShallowQueryOptions) =>
    sQueryAll(document.body, name, options),
  findByShallowName: (
    name: TextMatch,
    options?: ShallowQueryOptions,
    waitForOpts?: Parameters<typeof sFind>[3],
  ) => sFind(document.body, name, options, waitForOpts),
  findAllByShallowName: (
    name: TextMatch,
    options?: ShallowQueryOptions,
    waitForOpts?: Parameters<typeof sFindAll>[3],
  ) => sFindAll(document.body, name, options, waitForOpts),
};
