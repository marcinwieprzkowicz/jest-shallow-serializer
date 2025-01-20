import { randomUUID } from "node:crypto";
import React, { Suspense, type ReactNode } from "react";
import { isLazy } from "react-is";

export const getChildren = (children: ReactNode | ReactNode[]): ReactNode => {
  if (Array.isArray(children)) {
    return children.map((child) => getChildren(child));
  }

  if (isLazy(children)) {
    return React.createElement(
      Suspense,
      {
        key: randomUUID(),
      },
      children
    );
  }

  return children;
};
