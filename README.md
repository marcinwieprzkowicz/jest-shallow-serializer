# jest-shallow-serializer

A flexible jest serializer for shallow rendering React components. Unlike full shallow renderers, this tool focuses on serializing only the components you pick, making snapshots cleaner and more focused. Perfect for targeted testing with minimal noise! 🚀

## Features

- **Selective shallow rendering** - Choose which components to shallow render
- **Babel macro support** - Compile-time transformation for cleaner test files
- **Nested component support** - Mock context providers and nested exports
- **No external dependencies** - Works with Jest's built-in mocking

## Motivation

I created this package because existing solutions for shallow rendering are no longer maintained, and the testing ecosystem seems to be shifting toward other approaches. However, I still believe shallow rendering is a valuable technique for isolating and testing components effectively, and this serializer aims to fill that gap.

## Installation

1. Install package

```bash
npm install jest-shallow-serializer --save-dev
```

2. Add `jest-shallow-serializer` to `compilerOptions` types (in `tsconfig.json`):

```json
"types": ["jest-shallow-serializer"]
```

3. Add `jest-shallow-serializer` to snapshot serializers (in `jest.config` file):

```json
"snapshotSerializers": ["jest-shallow-serializer/serializer"]
```

4. Extend `global` scope (in `jest.config` file):

```json
"setupFilesAfterEnv": ["<rootDir>/jest.setup.js"]
```

**jest.setup.js**

```typescript
import { doShallow, shallowWrapper, shallowed } from "jest-shallow-serializer";

Object.assign(global, {
  doShallow,
  shallowWrapper,
  shallowed,
});
```

5. (Optional) You might need to add `doShallow`, `shallowWrapper` and `shallowed` as globals (in `eslint.config`):

```json
"globals": {
  "doShallow": "readonly",
  "shallowWrapper": "readonly",
  "shallowed": "readonly"
},
```

## Usage

Unlike `enzyme#shallow` or `react-test-renderer/shallow`, this library performs selective shallow rendering. Developers choose specific components to shallow render by mocking them.

### 1. Babel Macro (Recommended)

The Babel macro provides a cleaner syntax by transforming your code at compile time.

#### Installation

1. Install `babel-plugin-macros`:

```bash
npm install babel-plugin-macros --save-dev
```

2. Add `macros` plugin to your Babel config:

**babel.config.js**

```javascript
module.exports = {
  plugins: ["macros"],
};
```

3. You have to use `babel-jest`. Support for macros in `@swc/jest` and `esbuild-jest` is planned.

```javascript
// jest.config.js
module.exports = {
  transform: {
    "^.+\\.(t|j)sx?$": "babel-jest",
  },
};
```

#### Usage

```typescript
import shallowMock from "jest-shallow-serializer/macro";

shallowMock("@/components/component-name", "ComponentName");
```

The macro transforms this at compile time into:

```typescript
jest.mock(
  "@/components/component-name",
  shallowWrapper("@/components/component-name", "ComponentName"),
);
```

**Note:** The first argument must be a string literal (the module path).

### 2. `shallowWrapper` + `shallowed` + `jest.mock`

```typescript
import * as componentModule from "@/app/module/Component";
import { App } from "@/app/module/App";

jest.mock(
  "@/app/module/Component",
  shallowWrapper("@/app/module/Component", "ComponentName"),
);

const shallowedComponentModule = shallowed(componentModule);
```

### 3. `doShallow` + `require`

`doShallow` use `jest.doMock`, which is not hoisted, that's why we need to `require` shallowed module afterwards.

```typescript
import { App } from "@/app/module/App";

const shallowedComponentModule = doShallow(
  "@/app/module/Component",
  "ComponentName",
);

const { ComponentName } = require("@/app/module/Component");
```

After obtaining `shallowedComponentModule`, we can use it to `mock` / `unmock` a component:

```typescript
describe("Component", () => {
  afterEach(() => {
    shallowedComponentModule.unmock("ComponentName");
  });

  it("matches snapshot", () => {
    shallowedComponentModule.mock("ComponentName");

    const { asFragment } = render(<App />);

    expect(asFragment()).toMatchSnapshot();
  });

  it("next test", () => {
    render(<App />); // here `ComponentName` won't be shallowed
  });
});
```

## Next.js

If you're using Next.js, add the `macros` plugin to your Babel config:

```javascript
// babel.config.js
module.exports = {
  presets: ["next/babel"],
  plugins: ["macros"],
};
```

This works with both the App Router and Pages Router.

## Nested exports / Context

You can also use dot notation in component names to shallow mock nested components. For example, if you want to mock context provider, simply use `Context.Provider` as the component name.

```
src
├── context.ts
├── Component.tsx
├── Component.spec.tsx
```

**context.ts**

```typescript
export const Context = createContext<string | undefined>(undefined);
```

**Component.tsx**

```typescript
import { Context } from "./context";

export const Component = ({ children }: TestComponentContextProps) => {
  return <Context.Provider value="lorem ipsum">{children}</Context.Provider>;
};
```

**Component.spec.tsx**

```typescript
import { Component } from "./Component";
import { Context } from "./context";

jest.mock("./context", shallowWrapper("./context", "Context.Provider"));

const shallowedProvider = shallowed(Context);

describe("Component", () => {
  afterEach(() => {
    shallowedProvider.unmock("Context.Provider");
  });

  it("matches snapshot", () => {
    shallowedProvider.mock("Context.Provider");

    const { asFragment } = render(<Component />);

    expect(asFragment()).toMatchSnapshot();
  });
});
```
