import fs from "node:fs";
import path from "node:path";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { isJSXIdentifier } from "@babel/types";

const isRelative = (source: string) =>
  source.startsWith("./") || source.startsWith("../");

// only react component starts with capital letter
const isComponent = (name: string) => /^[A-Z]/.test(name);

export const getFirstTag = (filePath: string) => {
  const dir = path.dirname(filePath);
  const content = fs.readFileSync(filePath, "utf8");
  const ast = parse(content, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  const fileImports: Record<string, string> = {};
  let firstTag: string = "div";

  traverse(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value;

      path.node.specifiers.forEach((specifier) => {
        fileImports[specifier.local.name] = source;
      });
    },

    JSXOpeningElement(path) {
      const { name } = path.node;

      if (isJSXIdentifier(name)) {
        firstTag = name.name;

        if (isComponent(firstTag)) {
          const source = fileImports[firstTag];
          const componentPath = require.resolve(source, {
            paths: isRelative(source) ? [dir] : undefined,
          });

          firstTag = getFirstTag(componentPath);
        }

        path.stop();
      }
    },
  });

  return firstTag;
};
