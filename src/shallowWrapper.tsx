import React, { type JSX, type PropsWithChildren } from "react";
import { jest } from "@jest/globals";
import set from "set-value";
import stringify from "json-stringify-safe";
import type { ShallowWrapper } from "./types";
import { getChildren } from "./utils/getChildren";
import { getFirstTag } from "./utils/getFirstTag";
import { jsonReplacer } from "./utils/jsonReplacer";

export interface MockOptions {
  renderAs: string;
}

export const shallowWrapper = (
  modulePath: string,
  ...componentNames: string[]
) => {
  return (): ShallowWrapper => {
    const actual = jest.requireActual<Record<string, unknown>>(modulePath);
    const mocked = new Map();

    const wrapper: ShallowWrapper = {
      ...actual,
      mock: (name: string, options?: MockOptions) => {
        mocked.set(name, options);
      },
      unmock: (name: string) => {
        mocked.delete(name);
      },
    };

    componentNames.forEach((componentName) => {
      set(
        wrapper,
        componentName,
        jest.fn(({ children, ...props }: PropsWithChildren) => {
          const Component = actual[
            componentName
          ] as ({}: PropsWithChildren) => JSX.Element;

          if (mocked.has(componentName)) {
            const options = mocked.get(componentName);
            const tag =
              options?.renderAs || getFirstTag(require.resolve(modulePath));

            return React.createElement(
              tag,
              {
                "data-shallow-name": componentName,
                "data-shallow-props": stringify(
                  props,
                  jsonReplacer,
                  undefined,
                  () => "[Circular]"
                ),
              },
              getChildren(children)
            );
          }

          return <Component {...props}>{children}</Component>;
        })
      );
    });

    return wrapper;
  };
};

declare global {
  function shallowWrapper(
    modulePath: string,
    ...componentName: string[]
  ): () => ShallowWrapper;
}
