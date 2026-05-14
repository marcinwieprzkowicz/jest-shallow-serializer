import { createMacro, MacroParams } from "babel-plugin-macros";

export default createMacro(shallowMockMacro);

function shallowMockMacro({ references, babel }: MacroParams) {
  const { types } = babel;
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

    const requireCall = types.callExpression(types.identifier("require"), [
      types.stringLiteral("jest-shallow-serializer"),
    ]);

    const shallowWrapperMember = types.memberExpression(
      requireCall,
      types.identifier("shallowWrapper"),
    );

    const shallowWrapperCall = types.callExpression(shallowWrapperMember, [
      rawModulePath,
      ...componentNames,
    ]);

    // TODO: shallowWrapper should be split to return an inline factory function directly,
    // avoiding the need for this wrapper. Jest requires an arrow function AST node
    // as the second argument to jest.mock for safe hoisting.
    const factoryFn = types.arrowFunctionExpression(
      [],
      types.callExpression(shallowWrapperCall, []),
    );

    const jestMockCall = types.callExpression(
      types.memberExpression(
        types.identifier("jest"),
        types.identifier("mock"),
      ),
      [rawModulePath, factoryFn],
    );

    callPath.replaceWith(jestMockCall);
  });
}
