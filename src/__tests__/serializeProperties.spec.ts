import {
  serializeProperties,
  serializeProperty,
  toString,
  transformArray,
  transformObject,
  transformString,
} from "../serializeProperties";
import { indentation } from "../constants";

describe("serializeProperties", () => {
  afterEach(() => jest.clearAllMocks());

  describe("transformObject", () => {
    it("transforms an object", () => {
      const expected = `{
  firstName: "Joe",
  lastName: "Doe",
  age: 35,
  education: [
    {
      school: "MIT",
      graduationYear: 2015,
    },
  ],
}`;

      expect(
        transformObject(
          {
            firstName: "Joe",
            lastName: "Doe",
            age: 35,
            education: [
              {
                school: "MIT",
                graduationYear: 2015,
              },
            ],
          },
          0
        )
      ).toEqual(expected);
    });

    it("takes into account the `depth`", () => {
      const expected = `{
        firstName: "Joe",
        lastName: "Doe",
        age: 35,
        education: [
          {
            school: "MIT",
            graduationYear: 2015,
          },
        ],
      }`;

      expect(
        transformObject(
          {
            firstName: "Joe",
            lastName: "Doe",
            age: 35,
            education: [
              {
                school: "MIT",
                graduationYear: 2015,
              },
            ],
          },
          3
        )
      ).toEqual(expected);
    });
  });

  describe("transformArray", () => {
    it("transforms an array of numbers", () => {
      const expected = `[
  1,
  2,
  3,
]`;

      expect(transformArray([1, 2, 3], 0)).toEqual(expected);
    });

    it("transforms an array of strings", () => {
      const expected = `[
  "lorem",
  "ipsum",
]`;
      expect(transformArray(["lorem", "ipsum"], 0)).toEqual(expected);
    });

    it("transforms an array of objects", () => {
      const expected = `[
  {
    firstName: "Joe",
    lastName: "Doe",
    age: 35,
  },
  {
    firstName: "Jan",
    lastName: "Kowalski",
    age: 49,
  },
]`;

      expect(
        transformArray(
          [
            {
              firstName: "Joe",
              lastName: "Doe",
              age: 35,
            },
            {
              firstName: "Jan",
              lastName: "Kowalski",
              age: 49,
            },
          ],
          0
        )
      ).toEqual(expected);
    });

    it("takes into account the `depth`", () => {
      const expected = `[
        1,
        "lorem",
        {
          firstName: "Joe",
          lastName: "Doe",
          age: 23,
        },
      ]`;

      expect(
        transformArray(
          [
            1,
            "lorem",
            {
              firstName: "Joe",
              lastName: "Doe",
              age: 23,
            },
          ],
          3
        )
      ).toEqual(expected);
    });
  });

  describe("transformString", () => {
    it("adds double quotes around a string value", () => {
      expect(transformString("lorem ipsum")).toBe(`"lorem ipsum"`);
    });

    it("returns `[Function]`", () => {
      expect(transformString("[Function]")).toBe(`[Function]`);
    });

    it("returns `[MockFunction]`", () => {
      expect(transformString("[MockFunction]")).toBe(`[MockFunction]`);
    });
  });

  describe("toString", () => {
    it("stringifies booleans", () => {
      expect(toString(true, 0)).toBe("true");
      expect(toString(false, 0)).toBe("false");
    });

    it("stringifies numbers", () => {
      expect(toString(5, 0)).toBe("5");
      expect(toString(12.5123, 0)).toBe("12.5123");
    });

    it("stringifies strings", () => {
      expect(toString("lorem ipsum", 0)).toBe(`"lorem ipsum"`);
      expect(toString("[Function]", 0)).toBe("[Function]");
      expect(toString("[MockFunction]", 0)).toBe("[MockFunction]");
    });

    it("stringifies arrays", () => {
      expect(toString([1, 2, 3], 3)).toEqual(`[
        1,
        2,
        3,
      ]`);
      expect(toString(["a", "b", "c"], 3)).toEqual(`[
        "a",
        "b",
        "c",
      ]`);
      expect(toString([{ firstName: "Joe", lastName: "Doe", age: 38 }], 4))
        .toEqual(`[
          {
            firstName: "Joe",
            lastName: "Doe",
            age: 38,
          },
        ]`);
    });

    it("stringifies objects", () => {
      expect(
        toString(
          {
            firstName: "Joe",
            lastName: "Doe",
            age: 36,
            education: [
              {
                school: "MIT",
                graduationYear: 2015,
              },
            ],
          },
          3
        )
      ).toEqual(`{
        firstName: "Joe",
        lastName: "Doe",
        age: 36,
        education: [
          {
            school: "MIT",
            graduationYear: 2015,
          },
        ],
      }`);
    });

    it("stringifies `undefined`", () => {
      expect(toString(undefined, 0)).toBe("undefined");
    });

    it("stringifies `null`", () => {
      expect(toString(null, 0)).toBe("null");
    });
  });

  describe("serializeProperty", () => {
    it("adds brackets to the value", () => {
      expect(serializeProperty("key", null)).toBe("key={null}");
      expect(serializeProperty("key", undefined)).toBe("key={undefined}");
      expect(serializeProperty("key", true)).toBe("key={true}");
      expect(serializeProperty("key", false)).toBe("key={false}");
      expect(serializeProperty("key", 11)).toBe("key={11}");
      expect(serializeProperty("key", "[Function]")).toBe("key={[Function]}");
      expect(serializeProperty("key", "[MockFunction]")).toBe(
        "key={[MockFunction]}"
      );
      expect(serializeProperty("key", {})).toBe("key={{}}");
      expect(serializeProperty("key", { property: "value" })).toEqual(`key={
  {
    property: "value",
  }
}`);
      expect(serializeProperty("key", [1, 2, 3])).toEqual(`key={
  [
    1,
    2,
    3,
  ]
}`);
    });

    it("does not add brackets to the value", () => {
      expect(serializeProperty("key", "lorem ipsum")).toBe(`key="lorem ipsum"`);
    });
  });

  describe("serializeProperties", () => {
    it.each([
      {
        propsIndentation: indentation.repeat(0),
      },
      {
        propsIndentation: indentation.repeat(1),
      },
      {
        propsIndentation: indentation.repeat(2),
      },
      {
        propsIndentation: indentation.repeat(3),
      },
    ])("applies `$propsIndentation` indentation", ({ propsIndentation }) => {
      const props = {
        obj: {
          nested: {
            value: 5,
          },
        },
        text: "lorem ipsum",
      };

      expect(serializeProperties(props, propsIndentation)).toMatchSnapshot();
    });
  });
});
