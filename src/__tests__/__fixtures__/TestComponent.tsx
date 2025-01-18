import React, { type PropsWithChildren } from "react";

export interface TestComponentProps extends PropsWithChildren {
  obj?: any;
  prop: string;
}

export const TestComponent = ({
  children,
  obj = {},
  prop,
}: TestComponentProps) => {
  return (
    <div className="test-component" data-prop={prop} data-obj={obj}>
      <div className="test-component__body">{children}</div>
    </div>
  );
};
