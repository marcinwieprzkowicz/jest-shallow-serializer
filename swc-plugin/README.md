# SWC WASM Plugin for jest-shallow-serializer

A Rust-based SWC plugin that provides the same functionality as the JavaScript `jest-shallow-serializer/swc` module, compiled as an official SWC WASM plugin.

## Prerequisites

1. **Install Rust**: https://www.rust-lang.org/tools/install

2. **Add WASM target**:
   ```bash
   rustup target add wasm32-wasip1
   ```

## Build

```bash
cd swc-plugin
cargo build --target wasm32-wasip1 --release
```

The compiled plugin will be at:
```
target/wasm32-wasip1/release/swc_plugin_jest_shallow_serializer.wasm
```

## Usage

### In Jest config with @swc/jest

```javascript
// jest.config.js
const path = require('path');

module.exports = {
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          experimental: {
            plugins: [
              [
                path.resolve(__dirname, "swc-plugin/target/wasm32-wasip1/release/swc_plugin_jest_shallow_serializer.wasm"),
                {}
              ]
            ]
          }
        }
      }
    ]
  }
};
```

### In .swcrc

```json
{
  "jsc": {
    "experimental": {
      "plugins": [
        [
          "./swc-plugin/target/wasm32-wasip1/release/swc_plugin_jest_shallow_serializer.wasm",
          {}
        ]
      ]
    }
  }
}
```

## What it does

Transforms:
```typescript
import shallowMock from "jest-shallow-serializer/swc";

shallowMock("@/components/TestComponent", "TestComponent");
```

Into:
```typescript
jest.mock("@/components/TestComponent", shallowWrapper("@/components/TestComponent", "TestComponent"));
```

## Compatibility

This plugin uses the `swc_ast_unknown` cfg flag for backward compatibility with `@swc/core` v1.15.0+. See https://swc.rs/docs/plugin/ecmascript/compatibility for more details.

## Comparison with JavaScript approach

| Feature | JavaScript (`src/swc.ts`) | WASM Plugin (this folder) |
|---------|---------------------------|---------------------------|
| Setup | Import and use directly | Build Rust, configure path |
| Performance | Good | Better (native WASM) |
| Maintenance | Uses deprecated Visitor API | Uses official plugin API |
| Portability | Requires Node.js | Works in any SWC host |

## Development

### Testing

```bash
cargo test
```

### Linting

```bash
cargo clippy
```

## Publishing

To publish this as an npm package, you can use [swc_cli](https://swc.rs/docs/plugin/publishing):

```bash
swc plugin pack
```
