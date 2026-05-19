import React from "react";
import { render } from "@testing-library/react";
import { within } from "@testing-library/dom";
import { shallowWrapper } from "../../shallowWrapper";
import { getByShallowName, queryAllByShallowName, shallowQueries, screen } from "../index";

describe("shallow queries integration", () => {
  it("works with global getByShallowName", () => {
    const wrapper = shallowWrapper(
      "./__tests__/__fixtures__/TestComponent.tsx",
      "TestComponent"
    )();
    wrapper.mock("TestComponent");

    const TestComponent = wrapper.TestComponent as React.ComponentType<{
      prop?: string;
      children?: React.ReactNode;
    }>;

    const { container } = render(
      <TestComponent prop="lorem ipsum">children</TestComponent>
    );

    const result = getByShallowName(container, "TestComponent");

    expect(result.name).toBe("TestComponent");
    expect(result.props.prop).toBe("lorem ipsum");

    wrapper.unmock("TestComponent");
  });

  it("works with within from @testing-library/dom", () => {
    const wrapper = shallowWrapper(
      "./__tests__/__fixtures__/TestComponent.tsx",
      "TestComponent"
    )();
    wrapper.mock("TestComponent");

    const TestComponent = wrapper.TestComponent as React.ComponentType<{
      prop?: string;
      children?: React.ReactNode;
    }>;

    const { container } = render(
      <TestComponent prop="lorem ipsum">children</TestComponent>
    );

    const scoped = within(container, shallowQueries);
    const result = scoped.getByShallowName("TestComponent");

    expect(result.name).toBe("TestComponent");

    wrapper.unmock("TestComponent");
  });

  it("supports props filtering with within", () => {
    const wrapper = shallowWrapper(
      "./__tests__/__fixtures__/TestComponent.tsx",
      "TestComponent"
    )();
    wrapper.mock("TestComponent");

    const TestComponent = wrapper.TestComponent as React.ComponentType<{
      prop?: string;
      children?: React.ReactNode;
    }>;

    const { container } = render(
      <>
        <TestComponent prop="first">first</TestComponent>
        <TestComponent prop="second">second</TestComponent>
      </>
    );

    const scoped = within(container, shallowQueries);

    const results = scoped.queryAllByShallowName("TestComponent", {
      props: { prop: "first" },
    });

    expect(results).toHaveLength(1);
    expect(results[0].props.prop).toBe("first");

    wrapper.unmock("TestComponent");
  });

  it("works with screen pre-bound queries", () => {
    const wrapper = shallowWrapper(
      "./__tests__/__fixtures__/TestComponent.tsx",
      "TestComponent"
    )();
    wrapper.mock("TestComponent");

    const TestComponent = wrapper.TestComponent as React.ComponentType<{
      prop?: string;
      children?: React.ReactNode;
    }>;

    render(
      <TestComponent prop="lorem ipsum">children</TestComponent>
    );

    const result = screen.getByShallowName("TestComponent");

    expect(result.name).toBe("TestComponent");
    expect(result.props.prop).toBe("lorem ipsum");

    wrapper.unmock("TestComponent");
  });

  it("within queries custom render container correctly (not always body)", () => {
    const wrapper = shallowWrapper(
      "./__tests__/__fixtures__/TestComponent.tsx",
      "CustomContainerComponent"
    )();
    wrapper.mock("CustomContainerComponent");

    const CustomContainerComponent = wrapper.CustomContainerComponent as React.ComponentType<{ prop?: string }>;

    const { container: otherContainer } = render(
      React.createElement("div", null, "other component")
    );

    const { container: currentContainer } = render(
      <CustomContainerComponent prop="from-current" />
    );

    const scoped = within(currentContainer, shallowQueries);
    const result = scoped.getByShallowName("CustomContainerComponent");

    expect(result.props.prop).toBe("from-current");

    expect(() =>
      within(otherContainer, shallowQueries).getByShallowName("CustomContainerComponent")
    ).toThrow(/unable to find/i);

    wrapper.unmock("CustomContainerComponent");
  });

  it("global getByShallowName queries correct container", () => {
    const wrapper = shallowWrapper(
      "./__tests__/__fixtures__/TestComponent.tsx",
      "GlobalContainerComponent"
    )();
    wrapper.mock("GlobalContainerComponent");

    const GlobalContainerComponent = wrapper.GlobalContainerComponent as React.ComponentType<{ prop?: string }>;

    const { container: otherContainer } = render(
      React.createElement("div", null, "other stuff")
    );

    const { container: currentContainer } = render(
      <GlobalContainerComponent prop="target" />
    );

    const result = getByShallowName(currentContainer, "GlobalContainerComponent");

    expect(result.props.prop).toBe("target");

    expect(() =>
      getByShallowName(otherContainer, "GlobalContainerComponent")
    ).toThrow(/unable to find/i);

    wrapper.unmock("GlobalContainerComponent");
  });
});
