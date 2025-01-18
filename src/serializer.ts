import escape from "lodash.escape";
import type { Plugin } from "pretty-format";
import { serializeProperties, type Props } from "./serializeProperties";
import { isNode } from "./types";
import { indentation } from "./constants";

interface RenderProps {
  tag: string;
  props: Props;
  childrenAsString?: string;
  nodeIndentation: string;
  propsIndentation: string;
}

const render = ({
  tag,
  props,
  childrenAsString,
  nodeIndentation,
  propsIndentation,
}: RenderProps) => {
  const output: string[] = [];
  const propsAsString = serializeProperties(props, propsIndentation);

  if (propsAsString.length > 0) {
    output.push(`${nodeIndentation}<${tag}`);
    output.push(propsAsString);

    if (childrenAsString) {
      output.push(`${nodeIndentation}>`);
      output.push(childrenAsString);
      output.push(`${nodeIndentation}</${tag}>`);
    } else {
      output.push(`${nodeIndentation}/>`);
    }
  } else if (childrenAsString) {
    output.push(`${nodeIndentation}<${tag}>`);
    output.push(childrenAsString);
    output.push(`${nodeIndentation}</${tag}>`);
  } else {
    output.push(`${nodeIndentation}<${tag} />`);
  }

  return output.join("\n");
};

const shallowSerializer: Plugin = {
  serialize: (
    node: DocumentFragment | Element | Text,
    config,
    _,
    depth,
    refs,
    printer
  ) => {
    const nodeIndentation = indentation.repeat(depth);
    const propsIndentation = indentation.repeat(depth + 1);

    const children: string[] = [];
    node.childNodes.forEach((childNode) => {
      const child = printer(childNode, config, indentation, depth + 1, refs);
      children.push(child);
    });
    const childrenAsString = children.join("\n");

    if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      return `<DocumentFragment>
${childrenAsString}
</DocumentFragment>`;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tag = element.nodeName.toLowerCase();
      const props = Array.from(element.attributes).reduce<Props>(
        (accu, attribute) => {
          accu[attribute.name] = attribute.value;
          return accu;
        },
        {}
      );

      const shallowName = element.attributes.getNamedItem("data-shallow-name");
      const shallowProps =
        element.attributes.getNamedItem("data-shallow-props");

      if (shallowName && shallowProps) {
        const shallowTag = shallowName?.value as string;
        const shallowPropsAsJSON: Props = JSON.parse(
          shallowProps.value || "{}"
        );

        return render({
          tag: shallowTag,
          props: shallowPropsAsJSON,
          childrenAsString,
          nodeIndentation,
          propsIndentation,
        });
      }

      return render({
        tag,
        props,
        childrenAsString,
        nodeIndentation,
        propsIndentation,
      });
    }

    // text node
    return nodeIndentation + escape(node.textContent || "");
  },

  test: (value: unknown) => {
    return (
      isNode(value) &&
      (value.nodeType === Node.DOCUMENT_FRAGMENT_NODE ||
        value.nodeType === Node.ELEMENT_NODE ||
        value.nodeType === Node.TEXT_NODE)
    );
  },
};

module.exports = shallowSerializer;
