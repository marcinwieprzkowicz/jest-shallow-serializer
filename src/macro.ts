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

    const modulePath = args[0];
    const componentNames = args.slice(1);

    const jestMockCall = types.callExpression(
      types.memberExpression(
        types.identifier("jest"),
        types.identifier("mock"),
      ),
      [
        modulePath,
        types.callExpression(types.identifier("shallowWrapper"), [
          modulePath,
          ...componentNames,
        ]),
      ],
    );

    callPath.replaceWith(jestMockCall);
  });
}
