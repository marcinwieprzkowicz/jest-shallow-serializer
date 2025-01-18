const { serialize } = require("../serializer");

describe("serializer", () => {
  it("replaces node with `data-shallow-name` attribute", () => {
    const element = document.createElement("div");
    element.setAttribute("data-shallow-name", "MyComponentName");
    element.setAttribute("data-shallow-props", "{}");

    const output = serialize(element, null, null, 0);
    expect(output).toEqual("<MyComponentName />");
  });

  it("renders component properties", () => {
    const props = {
      obj: {
        bool: true,
        objectEmpty: {},
        arrayEmpty: [],
        arrayNumbers: [1, 2, 3],
        arrayStrings: ["a", "b", "c"],
        methodNormal: "[Function]",
        nestedObject: {
          methodMocked: "[MockFunction]",
          stringProperty: "dolor sit amet",
        },
        stringProperty: "lorem ipsum",
        numberProperty: 5,
      },
      arrayObjects: [
        {
          firstName: "John",
          lastName: "Doe",
        },
        {
          firstName: "Jan",
          lastName: "Kowalski",
        },
      ],
      bool: false,
      objectEmpty: {},
      arrayEmpty: [],
      arrayNumbers: [1, 2, 3],
      arrayStrings: ["a", "b", "c"],
      stringProperty: "lorem ipsum",
      numberProperty: 6,
    };
    const element = document.createElement("div");
    element.setAttribute("data-shallow-name", "MyComponentName");
    element.setAttribute("data-shallow-props", JSON.stringify(props));

    const output = serialize(element, null, null, 0);
    expect(output).toMatchSnapshot();
  });
});
