import React from "react";
import { TestComponentParent } from "./TestComponentParent";
import { TestComponentChild } from "./nested2/TestComponentChild";

export const TestComponent = () => {
  return (
    <TestComponentParent>
      <TestComponentChild />
      <TestComponentChild />
    </TestComponentParent>
  );
};
