import React from "react";
import { Embed as EmbedConfig } from "@client/schemas/schemaDesigner";
import { css } from "@emotion/css";
import { baseConfigToStyle } from "../../utils/styleUtils";

const generateClasses = ({
  left,
  top,
  currentHeight,
  currentWidth,
  backgroundColor,
  borderColor,
  borderWidth,
  borderRadius,
}: {
  left: number;
  top: number;
  currentHeight: any;
  currentWidth: any;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
}) => ({
  container: css`
    position: absolute;
    left: ${left}px;
    top: ${top}px;
    height: ${currentHeight + "px"};
    width: ${currentWidth + "px"};
    background: ${backgroundColor};
    border: ${borderWidth}px solid ${borderColor};
    box-sizing: border-box;
    border-radius: ${borderRadius}px;
  `,
});

function embedStyleConfig(config: EmbedConfig) {
  const style: React.CSSProperties = {
    ...baseConfigToStyle(config),
    backgroundColor: config.settings?.backgroundColor || "transparent",
    borderColor: config.settings?.borderColor,
    borderWidth: config.settings?.borderWidth,
    borderRadius: config.settings?.borderRadius,
  };

  return style;
}

function addEmbed(str: string) {
  if (str !== "") return str.endsWith("?embed") ? str : `${str}?embed`;
  else return "";
}

type EmbedProps = {
  config: EmbedConfig;
};

export const Embed = ({ config }: EmbedProps) => {
  const left = config.left ?? 0;
  const top = config.top ?? 0;
  const style = embedStyleConfig(config);
  let string = config?.settings?.link || "";
  const link = addEmbed(string);
  const currentWidth = config.width ?? 400;
  const currentHeight = config.height ?? 225;
  const backgroundColor = style?.backgroundColor ?? "transparent";
  const borderColor = style?.borderColor ?? "transparent";
  const borderWidth = (style?.borderWidth as number) ?? 0;
  const borderRadius = (style?.borderRadius as number) ?? 0;

  const classes = generateClasses({
    left,
    top,
    currentHeight,
    currentWidth,
    backgroundColor,
    borderColor,
    borderWidth,
    borderRadius,
  });

  return (
    <div className={classes.container}>
      <iframe
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          border: "none",
          padding: 0,
          margin: 0,
        }}
        loading="eager"
        src={link}
      ></iframe>
    </div>
  );
};

export default Embed;
