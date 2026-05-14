import React, { type PropsWithChildren } from "react";

interface TitleProps extends PropsWithChildren {
  level?: 1 | 2 | 3;
}

export const Title = ({ children, level = 1 }: TitleProps) => {
  if (level === 2) return <h2 className="title">{children}</h2>;
  if (level === 3) return <h3 className="title">{children}</h3>;
  return <h1 className="title">{children}</h1>;
};
