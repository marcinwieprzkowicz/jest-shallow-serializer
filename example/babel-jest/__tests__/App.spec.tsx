import React from "react";
import { render } from "@testing-library/react";
import shallowMock from "jest-shallow-serializer/macro";
import { App } from "../components/App";
import * as titleModule from "../components/Title";

shallowMock("../components/Title", "Title");
const shallowedTitle = shallowed(titleModule);

describe("App", () => {
  afterEach(() => {
    shallowedTitle.unmock("Title");
  });

  it("renders with shallow Title", () => {
    shallowedTitle.mock("Title");

    const { asFragment } = render(<App heading="Hello World" />);

    expect(asFragment()).toMatchSnapshot();
  });
});
