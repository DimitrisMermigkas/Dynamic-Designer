import React from "react";
import {
  InnerTextStyle,
  Textbox,
} from "@hella_project/common/validation/schemaDesigner";
import { configToStyle } from "../../utils/styleUtils";
import { getDynamicDetail } from "../../utils/textUtils";

type TextProps = { config: Textbox };

function StyledSpan({ style, text }: { style?: InnerTextStyle; text: string }) {
  const styleFormatted: React.CSSProperties = {
    color: style?.color,
    fontStyle: style?.fontStyle,
    fontWeight: style?.fontWeight,
    textDecoration: style?.underline ? "underline" : undefined,
    WebkitTextStrokeColor: style?.stroke || undefined,
    WebkitTextStrokeWidth: style?.strokeWidth || undefined,
  };
  return <span style={styleFormatted}>{text}</span>;
}

function renderTextWithLineBreaks(style?: InnerTextStyle, text?: string) {
  const parts = (text || "").split("\n");

  return (
    <>
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          <StyledSpan style={style} text={part} />
          {index < parts.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
}

const Text = ({ config }: TextProps) => {
  const style = configToStyle(config);

  return (
    <div style={style}>
      {config.settings.content?.map((part, index) => {
        return (
          <React.Fragment key={index}>
            {part.type === "dynamic" && part.text
              ? getDynamicDetail(part.text)
              : renderTextWithLineBreaks(part.style, part.text)}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Text;
