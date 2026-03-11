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
