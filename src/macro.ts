import path from "node:path";
import { createMacro, MacroParams } from "babel-plugin-macros";
import { isRelative as isPathRelative } from "./utils/isRelative";
import {
  arrowFunctionExpression,
  callExpression,
  identifier,
  isStringLiteral,
  memberExpression,
  stringLiteral,
  type ArgumentPlaceholder,
  type Expression,
  type SpreadElement,
} from "@babel/types";

/**
 * Resolves test file relative paths to absolute so `shallowWrapper`
 * (running from `dist/`) can load them. Leaves anything else untouched.
 */
function resolveModulePath(
  modulePath: ArgumentPlaceholder | SpreadElement | Expression,
  filename: string | null | undefined,
) {
  if (
    isStringLiteral(modulePath) &&
    isPathRelative(modulePath.value) &&
    filename
  ) {
    return stringLiteral(
      path.resolve(path.dirname(filename), modulePath.value),
    );
  }

  return modulePath;
}

function shallowMockMacro({ references, state }: MacroParams) {
  const { filename } = state.file.opts;
  const refs = references.default || references.shallowMock;

  refs.forEach((refPath) => {
    const callPath = refPath.parentPath;

    if (!callPath?.isCallExpression()) {
      throw new Error("shallowMock must be called as a function");
    }

    const args = callPath.node.arguments;

    if (args.length < 1) {
      throw new Error("shallowMock requires a module path");
    }

    const rawModulePath = args[0];
    const componentNames = args.slice(1);

    const requireCall = callExpression(identifier("require"), [
      stringLiteral("jest-shallow-serializer"),
    ]);

    const shallowWrapperMember = memberExpression(
      requireCall,
      identifier("shallowWrapper"),
    );

    const shallowWrapperCall = callExpression(shallowWrapperMember, [
      resolveModulePath(rawModulePath, filename),
      ...componentNames,
    ]);

    // TODO: shallowWrapper should be split to return an inline factory function directly,
    // avoiding the need for this wrapper. Jest requires an arrow function AST node
    // as the second argument to jest.mock for safe hoisting.
    const factoryFn = arrowFunctionExpression(
      [],
      callExpression(shallowWrapperCall, []),
    );

    // we use rawModulePath in `jest.mock`. Jest can resolve that one from the test file.
    const jestMockCall = callExpression(
      memberExpression(identifier("jest"), identifier("mock")),
      [rawModulePath, factoryFn],
    );

    callPath.replaceWith(jestMockCall);
  });
}

export default createMacro(shallowMockMacro);
