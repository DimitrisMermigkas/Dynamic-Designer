import { ObjectBase } from "@client/schemas/schemaDesigner";
import tinycolor from "tinycolor2";

export function convertColor(color?: string | null) {
  if (!color) return undefined;
  return tinycolor(color).toRgbString();
}

export function baseConfigToStyle(config: Partial<ObjectBase>) {
  const {
    left = 0,
    top = 0,
    width,
    height,
    // angle = 0,
    visible = true,
  } = config;

  const style: React.CSSProperties = {
    position: "absolute",
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`,
    boxSizing: "border-box",
    // transform: `rotate(${angle}deg)`,
    display: visible ? "block" : "none",
    transformOrigin: "top left",
  };

  return style;
}

type StyleConfig = {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  fill?: string;
  borderColor?: string | null;
  stroke?: string | null;
  strokeWidth?: number | null;
  borderWidth?: number | null;
  angle?: number;
  opacity?: number;
  visible?: boolean;
  backgroundColor?: string;
  type?: string;
  color?: string;
  settings?: any;
};

export function configToStyle(config: StyleConfig) {
  const {
    fill,
    stroke,
    strokeWidth,
    opacity,
    backgroundColor,
    borderColor,
    borderWidth,
    type,
    color,
  } = config;

  const {
    fontFamily,
    fontWeight,
    fontSize,
    textAlign,
    fontStyle,
    backgroundColor: settingsBackgroundColor,
    borderColor: settingsBorderColor,
    borderWidth: settingsBorderWidth,
  } = config.settings || {};

  const style: React.CSSProperties = {
    ...baseConfigToStyle(config),
    backgroundColor:
      convertColor(settingsBackgroundColor || backgroundColor || fill) ||
      "transparent",
    border: `${settingsBorderWidth ?? borderWidth ?? strokeWidth}px solid ${
      settingsBorderColor || borderColor || stroke
    }`,
    opacity: opacity,
    // boxShadow: shadow
    //   ? `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.color}`
    //   : "none",
    fontFamily,
    fontWeight,
    fontSize, //: fontSize ? `${fontSize}pt` : undefined,
    textAlign,
    fontStyle,
  };

  if (type === "IText") {
    delete style.backgroundColor;
    style.color = convertColor(color || fill) || "black";
  }

  return style;
}
