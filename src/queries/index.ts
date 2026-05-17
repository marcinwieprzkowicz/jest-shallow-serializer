export type { ShallowQueryResult, ShallowQueryOptions, TextMatch } from "./types";
export { buildShallowQueries } from "./buildShallowQueries";

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
