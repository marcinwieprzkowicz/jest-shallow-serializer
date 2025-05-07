import React, { type JSX, type ComponentType, lazy, act } from "react";
import { render } from "@testing-library/react";
import { shallowWrapper } from "../shallowWrapper";
import type { TestComponentProps } from "./__fixtures__/TestComponent";
import type { TestComponentSuspenseProps } from "./__fixtures__/TestComponentSuspense";
import type { TestComponentContextProps } from "./__fixtures__/TestComponentContext";

type Component = (props: TestComponentProps) => JSX.Element;
type ComponentTd = () => JSX.Element;
type ComponentSuspense = (props: TestComponentSuspenseProps) => JSX.Element;
type ComponentContext = (props: TestComponentContextProps) => JSX.Element;

let objectWithCircularReference = {};
Object.assign(objectWithCircularReference, {
  nested: {
    arr: [
      {
        item: {
          value: "lorem ipsum",
        },
      },
    ],
  },
});
Object.assign(objectWithCircularReference, {
  circularReference: objectWithCircularReference,
});

describe("shallowWrapper", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns wrapped component", () => {
    const wrapper = shallowWrapper(
      "./__tests__/__fixtures__/TestComponent.tsx",
      "TestComponent"
    )();

    expect(wrapper.mock).toBeDefined();
    expect(wrapper.unmock).toBeDefined();
    expect(wrapper.TestComponent).toBeDefined();
  });

  it("does not mock `component` by default", () => {
    const wrapper = shallowWrapper(
      "./__tests__/__fixtures__/TestComponent.tsx",
      "TestComponent"
    )();
    const TestComponent = wrapper.TestComponent as Component;

    const { asFragment } = render(
      <TestComponent prop="lorem ipsum">children</TestComponent>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  describe("`mock` function", () => {
    it("mocks `component`", () => {
      const wrapper = shallowWrapper(
        "./__tests__/__fixtures__/TestComponent.tsx",
        "TestComponent"
      )();
      wrapper.mock("TestComponent");

      const TestComponent = wrapper.TestComponent as Component;
      const { asFragment } = render(
        <TestComponent prop="lorem ipsum">children</TestComponent>
      );

      expect(asFragment()).toMatchSnapshot();
      wrapper.unmock("TestComponent");
    });

    it("supports circular references", () => {
      const wrapper = shallowWrapper(
        "./__tests__/__fixtures__/TestComponent.tsx",
        "TestComponent"
      )();
      wrapper.mock("TestComponent");

      const TestComponent = wrapper.TestComponent as Component;
      const { asFragment } = render(
        <TestComponent prop="lorem ipsum" obj={objectWithCircularReference}>
          children
        </TestComponent>
      );

      expect(asFragment()).toMatchSnapshot();
      wrapper.unmock("TestComponent");
    });

    it("supports functions", () => {
      const wrapper = shallowWrapper(
        "./__tests__/__fixtures__/TestComponent.tsx",
        "TestComponent"
      )();
      wrapper.mock("TestComponent");

      const TestComponent = wrapper.TestComponent as Component;
      const { asFragment } = render(
        <TestComponent
          prop="lorem ipsum"
          obj={{ method: () => {}, mockMethod: jest.fn() }}
        >
          children
        </TestComponent>
      );

      expect(asFragment()).toMatchSnapshot();
      wrapper.unmock("TestComponent");
    });

    it("supports nested component paths", () => {
      const wrapper = shallowWrapper(
        "./__tests__/__fixtures__/TestComponentContext",
        "TestContext.Provider"
      )();
      wrapper.mock("TestContext.Provider");

      const TestComponentContext =
        wrapper.TestComponentContext as ComponentContext;
      const { asFragment } = render(
        <TestComponentContext>lorem ipsum</TestComponentContext>
      );

      expect(asFragment()).toMatchSnapshot();
      wrapper.unmock("TestContext.Provider");
    });

    describe("lazy components", () => {
      let wrapper;

      beforeEach(() => {
        wrapper = shallowWrapper(
          "./__tests__/__fixtures__/TestComponentSuspense.tsx",
          "TestComponentSuspense"
        )();
        wrapper.mock("TestComponentSuspense");
      });

      afterEach(() => {
        wrapper.unmock("TestComponentSuspense");
      });

      it("renders resolved components", async () => {
        const promise = Promise.resolve<{ default: ComponentType<{}> }>({
          default: () => <div>I'm lazy</div>,
        });
        const LazyComponent = lazy(() => promise);

        const TestComponentSuspense =
          wrapper.TestComponentSuspense as ComponentSuspense;

        const { asFragment } = render(
          <TestComponentSuspense>
            <h1>Heading</h1>
            <LazyComponent />
          </TestComponentSuspense>
        );

        await act(() => promise);
        expect(asFragment()).toMatchSnapshot();
      });

      it("does not render unresolved components", async () => {
        const promise = Promise.resolve<{ default: ComponentType<{}> }>({
          default: () => <div>I'm lazy</div>,
        });
        const LazyComponent = lazy(() => promise);

        const TestComponentSuspense =
          wrapper.TestComponentSuspense as ComponentSuspense;

        const { asFragment } = render(
          <TestComponentSuspense>
            <h1>Heading</h1>
            <LazyComponent />
          </TestComponentSuspense>
        );

        expect(asFragment()).toMatchSnapshot();
        await act(() => promise);
      });
    });

    it("uses the first tag from the component body", () => {
      const wrapper = shallowWrapper(
        "./__tests__/__fixtures__/TestComponentTd.tsx",
        "TestComponentTd"
      )();
      wrapper.mock("TestComponentTd");

      const TestComponentTd = wrapper.TestComponentTd as ComponentTd;
      const { asFragment } = render(<TestComponentTd />, {
        wrapper: ({ children }) => (
          <table>
            <tbody>
              <tr>{children}</tr>
            </tbody>
          </table>
        ),
      });

      expect(asFragment()).toMatchSnapshot();
      wrapper.unmock("TestComponentTd");
    });

    it("uses `options.renderAs` as render tag", () => {
      const wrapper = shallowWrapper(
        "./__tests__/__fixtures__/TestComponent.tsx",
        "TestComponent"
      )();
      wrapper.mock("TestComponent", { renderAs: "span" });

      const TestComponent = wrapper.TestComponent as Component;
      const { asFragment } = render(
        <TestComponent prop="lorem ipsum">children</TestComponent>
      );

      expect(asFragment()).toMatchSnapshot();
      wrapper.unmock("TestComponent");
    });
  });

  describe("`unmock` function", () => {
    it("unmocks `component`", () => {
      const wrapper = shallowWrapper(
        "./__tests__/__fixtures__/TestComponent.tsx",
        "TestComponent"
      )();
      wrapper.mock("TestComponent");
      wrapper.unmock("TestComponent");

      const TestComponent = wrapper.TestComponent as Component;
      const { asFragment } = render(
        <TestComponent prop="lorem ipsum">children</TestComponent>
      );

      expect(asFragment()).toMatchSnapshot();
    });
  });
});
