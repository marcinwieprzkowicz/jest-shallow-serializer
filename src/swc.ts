import { parseSync, printSync } from "@swc/core";
import { Visitor } from "@swc/core/Visitor";
import type {
  Argument,
  CallExpression,
  Expression,
  Module,
  ModuleItem,
  Program,
  Span,
  StringLiteral,
} from "@swc/core";

const MACRO_PACKAGE = "jest-shallow-serializer/swc";

const EMPTY_SPAN: Span = { start: 0, end: 0, ctxt: 0 };

export function transform(
  code: string,
  filename?: string
): string {
  const ast = parseSync(code, {
    syntax: "typescript",
    tsx: filename?.endsWith(".tsx") ?? false,
  });

  const visitor = new ShallowMockVisitor();
  const transformed = visitor.visitProgram(ast) as Program;

  const result = printSync(transformed);
  return result.code;
}

export class ShallowMockVisitor extends Visitor {
  private importBindings: Set<string> = new Set();

  visitModule(m: Module): Module {
    this.importBindings = new Set();

    for (const item of m.body) {
      if (
        item.type === "ImportDeclaration" &&
        item.source.value === MACRO_PACKAGE
      ) {
        for (const specifier of item.specifiers) {
          if (specifier.type === "ImportDefaultSpecifier") {
            this.importBindings.add(specifier.local.value);
          } else if (specifier.type === "ImportSpecifier") {
            this.importBindings.add(specifier.local.value);
          }
        }
      }
    }

    return super.visitModule(m);
  }

  visitModuleItems(items: ModuleItem[]): ModuleItem[] {
    return items
      .filter(
        (item) =>
          !(
            item.type === "ImportDeclaration" &&
            item.source.value === MACRO_PACKAGE
          )
      )
      .map((item) => this.visitModuleItem(item));
  }

  visitCallExpression(n: CallExpression): Expression {
    if (
      n.callee.type === "Identifier" &&
      this.importBindings.has(n.callee.value)
    ) {
      const args = n.arguments;

      if (args.length < 1) {
        throw new Error("shallowMock requires a module path");
      }

      const modulePath = args[0].expression as StringLiteral;
      const componentNames = args.slice(1);

      return {
        type: "CallExpression",
        span: n.span,
        ctxt: 0,
        callee: {
          type: "MemberExpression",
          span: EMPTY_SPAN,
          object: {
            type: "Identifier",
            span: EMPTY_SPAN,
            value: "jest",
            optional: false,
            ctxt: 0,
          },
          property: {
            type: "Identifier",
            span: EMPTY_SPAN,
            value: "mock",
            optional: false,
            ctxt: 0,
          },
        },
        arguments: [
          { expression: modulePath, spread: null } as unknown as Argument,
          {
            expression: {
              type: "CallExpression",
              span: EMPTY_SPAN,
              ctxt: 0,
              callee: {
                type: "Identifier",
                span: EMPTY_SPAN,
                value: "shallowWrapper",
                optional: false,
                ctxt: 0,
              },
              arguments: [
                { expression: modulePath, spread: null } as unknown as Argument,
                ...componentNames,
              ],
            },
            spread: null,
          } as unknown as Argument,
        ],
      } as CallExpression;
    }

    return super.visitCallExpression(n);
  }
}
