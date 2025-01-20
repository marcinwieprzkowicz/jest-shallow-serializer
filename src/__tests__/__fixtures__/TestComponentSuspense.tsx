import React, { type PropsWithChildren, Suspense } from "react";

export interface TestComponentSuspenseProps extends PropsWithChildren {}

export const TestComponentSuspense = ({
  children,
}: TestComponentSuspenseProps) => {
  return (
    <div>
      <Suspense fallback={<span>Loading...</span>}>{children}</Suspense>
    </div>
  );
};
