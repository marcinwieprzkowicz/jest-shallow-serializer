import React, { createContext, PropsWithChildren } from "react";

export interface TestComponentContextProps extends PropsWithChildren {}

export const TestContext = createContext<string | undefined>(undefined);

export const TestComponentContext = ({
  children,
}: TestComponentContextProps) => {
  return (
    <TestContext.Provider value="lorem ipsum">{children}</TestContext.Provider>
  );
};
