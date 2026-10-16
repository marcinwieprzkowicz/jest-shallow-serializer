import * as babel from "@babel/core";
import * as path from "path";

const macroPath = path.resolve(__dirname, "../macro");
const shallowMockMacro = require(macroPath).default;

describe("macro", () => {
  it("transforms shallowMock to jest.mock", () => {
    const code = `
import shallowMock from "${macroPath.replace(/\\/g, "/")}";

shallowMock("@/components/TestComponent", "TestComponent");
`;

    const result = babel.transformSync(code, {
      filename: "test.ts",
      plugins: [
        ["macros", { shallowMock: shallowMockMacro }],
        "@babel/plugin-transform-typescript",
      ],
    });

    expect(result?.code).toMatchSnapshot();
  });

  it("resolves relative paths to absolute for shallowWrapper", () => {
    const code = `
import shallowMock from "${macroPath.replace(/\\/g, "/")}";

shallowMock("../components/Title", "Title");
`;

    const filename = path.resolve(__dirname, "example-__tests__/App.spec.tsx");
    const result = babel.transformSync(code, {
      filename,
      plugins: [
        ["macros", { shallowMock: shallowMockMacro }],
        "@babel/plugin-transform-typescript",
      ],
    });

    const expectedAbsolute = path
      .resolve(path.dirname(filename), "../components/Title")
      .replace(/\\/g, "/");

    // jest.mock key stays relative (resolved by Jest relative to test file)
    expect(result?.code).toContain('jest.mock("../components/Title"');
    // shallowWrapper arg is absolute (resolved relative to dist file at runtime)
    expect(result?.code).toContain(`"${expectedAbsolute}"`);
  });

  it("throws error when shallowMock is not called as function", () => {
    const code = `
import shallowMock from "${macroPath.replace(/\\/g, "/")}";

const x = shallowMock;
`;

    expect(() => {
      babel.transformSync(code, {
        filename: "test.ts",
        plugins: [
          ["macros", { shallowMock: shallowMockMacro }],
          "@babel/plugin-transform-typescript",
        ],
      });
    }).toThrow("shallowMock must be called as a function");
  });

  it("throws error when module path is missing", () => {
    const code = `
import shallowMock from "${macroPath.replace(/\\/g, "/")}";

shallowMock();
`;

    expect(() => {
      babel.transformSync(code, {
        filename: "test.ts",
        plugins: [
          ["macros", { shallowMock: shallowMockMacro }],
          "@babel/plugin-transform-typescript",
        ],
      });
    }).toThrow("shallowMock requires a module path");
  });
});
