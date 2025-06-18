import React from "react";
import { ButtonObject } from "@hella_project/common/validation/schemaDesigner";
import { baseConfigToStyle, convertColor } from "../../utils/styleUtils";

export const ButtonSettings = {
  backgroundColor: "#FFFFFF",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "#e51a29",
  borderRadius: 4,
  buttonText: "",
  fontSize: 32,
  fontFamily: "Poppins",
  buttonTextColor: "#1C1D21",
};

type ButtonProps = {
  config: ButtonObject;
  handleTrigger: (action: "onClick") => void;
};

function buttonConfigToStyle(config: ButtonObject) {
  const style: React.CSSProperties = {
    ...baseConfigToStyle(config),
    backgroundColor:
      convertColor(config.settings?.backgroundColor) ||
      ButtonSettings.backgroundColor,
    borderColor:
      convertColor(config.settings?.borderColor) || ButtonSettings.borderColor,
    borderRadius: config.settings?.borderRadius || ButtonSettings.borderRadius,
    borderStyle: config.settings?.borderStyle || ButtonSettings.borderStyle,
    borderWidth: config.settings?.borderWidth || ButtonSettings.borderWidth,
    color:
      convertColor(config.settings?.buttonTextColor) ||
      ButtonSettings.buttonTextColor,
    fontFamily: config.settings?.fontFamily || ButtonSettings.fontFamily,
    fontSize: config.settings?.fontSize || ButtonSettings.fontSize,
    padding: 0,
    boxSizing: "border-box",
  };

  return style;
}

export const Button = ({ config, handleTrigger }: ButtonProps) => {
  const style = buttonConfigToStyle(config);

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleTrigger("onClick");
  };

  return (
    <button style={style} onClick={onClick}>
      <span
        style={{
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          color: style.color,
        }}
      >
        {config?.settings?.buttonText || ButtonSettings.buttonText}
      </span>
    </button>
  );
};

export default Button;
