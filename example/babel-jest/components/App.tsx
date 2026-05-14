import React from "react";
import { Title } from "./Title";

interface AppProps {
  heading: string;
}

export const App = ({ heading }: AppProps) => (
  <div className="app">
    <Title level={2}>{heading}</Title>
    <p>App content</p>
  </div>
);
