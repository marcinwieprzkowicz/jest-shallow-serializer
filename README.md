# jest-shallow-serializer

A flexible jest serializer for shallow rendering React components. Unlike full shallow renderers, this tool focuses on serializing only the components you pick, making snapshots cleaner and more focused. Perfect for targeted testing with minimal noise! 🚀

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

Unlike `enzyme#shallow` or `react-test-renderer/shallow`, this library performs selective shallow rendering. Developers choose specific components to shallow render by mocking them. There are two ways to mock a component:

### 1. `shallowWrapper`, `shallowed` and `jest.mock`

```typescript
import * as componentModule from "@/app/module/Component";
import { App } from "@/app/module/App";

jest.mock(
  "@/app/module/Component",
  shallowWrapper("@/app/module/Component", "ComponentName")
);

const shallowedComponentModule = shallowed(componentModule);
```

### 2. `doShallow` + `require`

`doShallow` use `jest.doMock`, which is not hoisted, that's why we need to `require` shallowed module afterwards.

```typescript
import { App } from "@/app/module/App";

const shallowedComponentModule = doShallow(
  "@/app/module/Component",
  "ComponentName"
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
