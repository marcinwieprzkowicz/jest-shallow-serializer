import { transform, ShallowMockVisitor } from "../swc";
import { parseSync, printSync } from "@swc/core";
import type { Program } from "@swc/core";

describe("swc transform", () => {
  it("transforms shallowMock to jest.mock", () => {
    const code = `
import shallowMock from "jest-shallow-serializer/swc";

shallowMock("@/components/TestComponent", "TestComponent");
`;

    const result = transform(code, "test.ts");

    expect(result).toMatchSnapshot();
  });

  it("transforms shallowMock with multiple component names", () => {
    const code = `
import shallowMock from "jest-shallow-serializer/swc";

shallowMock("@/components/index", "Button", "Input", "Select");
`;

    const result = transform(code, "test.ts");

    expect(result).toMatchSnapshot();
  });

  it("transforms named import shallowMock", () => {
    const code = `
import { shallowMock } from "jest-shallow-serializer/swc";

shallowMock("@/components/TestComponent", "TestComponent");
`;

    const result = transform(code, "test.ts");

    expect(result).toMatchSnapshot();
  });

  it("preserves other imports", () => {
    const code = `
import shallowMock from "jest-shallow-serializer/swc";
import { render } from "@testing-library/react";

shallowMock("@/components/TestComponent", "TestComponent");
`;

    const result = transform(code, "test.ts");

    expect(result).toMatchSnapshot();
  });

  it("throws error when module path is missing", () => {
    const code = `
import shallowMock from "jest-shallow-serializer/swc";

shallowMock();
`;

    expect(() => {
      transform(code, "test.ts");
    }).toThrow("shallowMock requires a module path");
  });

  it("does not transform calls without shallowMock import", () => {
    const code = `
function shallowMock() {}

shallowMock("@/components/TestComponent", "TestComponent");
`;

    const result = transform(code, "test.ts");

    expect(result).toMatchSnapshot();
  });

  it("handles TSX files", () => {
    const code = `
import shallowMock from "jest-shallow-serializer/swc";

shallowMock("@/components/TestComponent", "TestComponent");

const App = () => <div>Hello</div>;
`;

    const result = transform(code, "test.tsx");

    expect(result).toMatchSnapshot();
  });

  it("allows using ShallowMockVisitor directly", () => {
    const code = `
import shallowMock from "jest-shallow-serializer/swc";

shallowMock("@/components/TestComponent", "TestComponent");
`;

    const ast = parseSync(code, { syntax: "typescript" });
    const visitor = new ShallowMockVisitor();
    const transformed = visitor.visitProgram(ast) as Program;
    const result = printSync(transformed);

    expect(result.code).toMatchSnapshot();
  });
});
