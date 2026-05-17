# Shallow Queries Design Spec

**Date:** 2026-05-17
**Status:** Approved

## Problem

Users need to find shallow-rendered components in test output, narrow results by props, and assert on prop values - similar to Testing Library's query API but for shallow-rendered components.

## Architecture

### Core Components

**New files:**
- `src/queries/queryShallow.ts` - Base query function
- `src/queries/buildShallowQueries.ts` - Generates all 6 query variants
- `src/queries/types.ts` - TypeScript types
- `src/queries/index.ts` - Public exports

### Query Flow

1. `queryAllByShallowName(container, name, options)` uses `querySelectorAll('[data-shallow-name]')`
2. Filter by name match (string, regex, or function - Testing Library's TextMatch pattern)
3. Optionally filter by props via `options.props` (partial match)
4. Return `ShallowQueryResult[]` with `{ name, props, element }`
5. `buildShallowQueries` wraps base query into 6 variants with proper error handling

### Query Variants (Testing Library pattern)

| Variant | 0 matches | 1 match | >1 matches | Async |
|---------|-----------|---------|------------|-------|
| `getByShallowName` | throw | return | throw | no |
| `queryByShallowName` | null | return | throw | no |
| `findByShallowName` | throw | return | throw | yes |
| `getAllByShallowName` | throw | array | array | no |
| `queryAllByShallowName` | [] | array | array | no |
| `findAllByShallowName` | throw | array | array | yes |

### Global vs Scoped Queries

**Global (pre-bound to document.body, like screen):**
```typescript
import { getByShallowName } from "jest-shallow-serializer";
getByShallowName("Button", { props: { variant: "primary" } });
```

**Scoped (via Testing Library within):**
```typescript
import { within } from "@testing-library/dom";
import * as shallowQueries from "jest-shallow-serializer/queries";
within(container, { queries: shallowQueries }).getByShallowName("Button");
```

## Types

```typescript
type TextMatch = string | RegExp | ((name: string, element: Element) => boolean);

interface ShallowQueryOptions {
  props?: Record<string, unknown>;
}

interface ShallowQueryResult {
  name: string;
  props: Record<string, unknown>;
  element: Element;
}
```

## Props Filtering

- Shallow partial match - only specified top-level keys are checked
- Functions compared as `"[Function]"` / `"[MockFunction]"` (serialized form)
- Nested props supported via exact key matching (e.g., `props: { "obj.method": "value" }`)

## Error Handling

- Error messages follow Testing Library format: `Unable to find an element with shallow name: "Button"`
- `findBy` variants use `waitFor` with default 1000ms timeout, configurable via `waitForOptions`

## Exports

- `jest-shallow-serializer` - global query exports + existing exports
- `jest-shallow-serializer/queries` - all query functions for use with `within`
- New entry point in `package.json` exports

## Testing

- Unit tests for base query function
- Tests for all 6 query variants
- Tests for props filtering and TextMatch
- Integration tests with `within` from `@testing-library/dom`

## Limitations

- Props are JSON-serialized; functions appear as `"[Function]"` strings
- Queries operate on rendered DOM, not React tree
