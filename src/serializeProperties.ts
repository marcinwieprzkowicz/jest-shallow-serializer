import { isPlainObject } from "./types";
import { indentation } from "./constants";

export type Props = Record<string, unknown>;

export const transformObject = (
  obj: Record<string, unknown>,
  depth: number
): string => {
  const output: string[] = ["{"];

  Object.keys(obj).forEach((key) => {
    const value = toString(obj[key], depth + 1);
    output.push(`${indentation.repeat(depth + 1)}${key}: ${value},`);
  });
  output.push(`${indentation.repeat(depth)}}`);

  return output.join("\n");
};

export const transformArray = (items: unknown[], depth: number): string => {
  const output: string[] = [`[`];

  items.forEach((item) => {
    const value = toString(item, depth + 1);
    output.push(`${indentation.repeat(depth + 1)}${value},`);
  });

  output.push(`${indentation.repeat(depth)}]`);

  return output.join("\n");
};

export const transformString = (str: string): string => {
  if (str !== "[Function]" && str !== "[MockFunction]") {
    return `"${str}"`;
  }

  return str;
};

export const toString = (value: unknown, depth: number) => {
  if (isPlainObject(value) && Object.keys(value).length > 0) {
    return transformObject(value, depth);
  }

  if (Array.isArray(value) && value.length > 0) {
    return transformArray(value, depth);
  }

  if (typeof value === "string") {
    return transformString(value);
  }

  if (typeof value === "undefined") {
    return "undefined";
  }

  return JSON.stringify(value);
};

export const serializeProperty = (key: string, value: unknown) => {
  const asString = toString(value, 0);
  const lines = asString.split("\n");

  if (
    typeof value === "string" &&
    value !== "[Function]" &&
    value !== "[MockFunction]"
  ) {
    return `${key}=${asString}`;
  }

  if (lines.length > 1) {
    const shifted = lines.map((line) => `${indentation}${line}`);

    return `${key}={
${shifted.join("\n")}
}`;
  }

  return `${key}={${asString}}`;
};

export const serializeProperties = (
  props: Props,
  propsIndentation: string
): string => {
  return Object.keys(props)
    .map((key) => {
      return serializeProperty(key, props[key])
        .split("\n")
        .map((p) => `${propsIndentation}${p}`)
        .join("\n");
    })
    .join("\n");
};
