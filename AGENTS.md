# AGENTS.md - Developer Guide

This file provides guidelines and commands for agents working in this repository.

## Project Overview

`jest-shallow-serializer` is a Jest serializer for shallow rendering React components in snapshots. It transforms components into custom `<ComponentName data-shallow-props="..." />` elements, allowing selective serialization of nested components.

## Commands

### Build

```bash
npm run build    # Compile TypeScript to ./dist
```

### Testing

```bash
npm run test           # Run unit tests + type checking
npm run test:unit      # Run Jest tests only
npm run test:static    # TypeScript type checking only (tsc --noEmit)
```

**Run a single test:**

```bash
# By file path
npx jest src/__tests__/serializer.spec.ts

# By test name
npx jest --testNamePattern="replaces node"

# By file name pattern
npx jest serializer.spec.ts
```

### Code Quality

This project uses:
- **TypeScript** with strict mode enabled (`strict: true` in tsconfig.json)
- **Jest** for testing
- **@swc/jest** for fast test execution

There is no separate linter configured - TypeScript's strict mode and IDE integrations should catch most issues.

## Code Style Guidelines

### General Principles

- Write clean, readable, and maintainable code
- Prefer explicit over implicit
- Keep functions small and focused (single responsibility)
- Document non-obvious decisions with comments when needed

### TypeScript

- Always use explicit types for function parameters and return types
- Use `type` for simple type aliases, `interface` for object shapes
- Enable `strict: true` - do not use `any` unless absolutely necessary
- Use optional chaining (`?.`) and nullish coalescing (`??`) appropriately

```typescript
// Good
const getName = (user: User | null): string => {
  return user?.name ?? "Anonymous";
};

// Avoid
const getName = (user) => {
  return user && user.name || "Anonymous";
};
```

### Naming Conventions

- **Files**: PascalCase for components (`ShallowWrapper.tsx`), camelCase for utilities (`jsonReplacer.ts`)
- **Functions/Variables**: camelCase
- **Types/Interfaces**: PascalCase
- **Constants**: SCREAMING_SNAKE_CASE for config values, camelCase otherwise
- **React Components**: PascalCase

### Imports

- Use absolute imports from package root for internal code
- Group imports in this order: external libraries, internal modules, types
- Use `import { x } from "..."` for named exports
- Use `import type { X }` for type-only imports

```typescript
import React, { type JSX, type PropsWithChildren } from "react";
import set from "set-value";
import stringify from "json-stringify-safe";

import type { ShallowWrapper } from "./types";
import { getChildren } from "./utils/getChildren";
```

### React Patterns

- Use functional components with hooks
- Use TypeScript types for props (`interface Props { ... }`)
- Destructure props with defaults where appropriate

```typescript
interface ButtonProps {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

export const Button = ({ label, onClick, variant = "primary" }: ButtonProps) => {
  return <button className={variant} onClick={onClick}>{label}</button>;
};
```

### Error Handling

- Use descriptive error messages that explain what went wrong
- Throw errors with context for debugging

```typescript
if (args.length < 1) {
  throw new Error("shallowMock requires a module path");
}
```

### Testing

- Place tests adjacent to source files with `.spec.ts` or `.spec.tsx` extension
- Use `describe` blocks for grouping related tests
- Use clear, descriptive test names that explain the expected behavior
- Use Jest's built-in matchers (`toEqual`, `toBe`, `toMatchSnapshot`, etc.)

```typescript
describe("serializer", () => {
  it("replaces node with `data-shallow-name` attribute", () => {
    // test implementation
  });
});
```

### Formatting

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas
- Use semicolons

This project uses Prettier defaults via IDE - no explicit config required.

### Global Declarations

Use `declare global` for adding globals:

```typescript
declare global {
  function shallowWrapper(
    modulePath: string,
    ...componentName: string[]
  ): () => ShallowWrapper;
}
```

## Project Structure

```
src/
├── index.ts           # Main entry point
├── serializer.ts      # Jest serializer
├── shallowWrapper.tsx # Mock factory
├── types.ts           # TypeScript types
├── constants.ts       # Constants
├── doShallow.ts       # Shallow render logic
├── shallowed.ts       # Shallow state wrapper
├── macro.ts           # Babel macro for transforms
└── utils/             # Utility functions
    ├── getChildren.ts
    ├── getFirstTag.ts
    └── jsonReplacer.ts
```

## Package Exports

The package exposes multiple entry points:

- `jest-shallow-serializer` - main entry with `shallowWrapper`
- `jest-shallow-serializer/serializer` - Jest serializer only
- `jest-shallow-serializer/macro` - Babel macro for compile-time transforms
