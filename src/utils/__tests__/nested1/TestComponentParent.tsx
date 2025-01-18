import React, { type PropsWithChildren } from "react";

export const TestComponentParent = ({ children }: PropsWithChildren) => {
  return <div>{children}</div>;
};
