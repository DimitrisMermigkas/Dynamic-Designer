import { useTheme } from "@mui/material";
import ColorPicker from "../../../../components/ColorPicker/ColorPicker";
import CustomTextField from "../../../../components/TextFields/CustomTextField";
import React from "react";
import { findLineBasedOnCursosPos } from "./TextEditor";

type CustomColorAlphaPickerProps = {
  onColorChange;
  selectedObject;
  hasBorder?: boolean;
  fixedHeight;
  buttonWidth;
  buttonHeight;
  textFieldStyle;
  colorFill?: any;
};

const CustomColorAlphaPicker = ({
  onColorChange,
  selectedObject,
  hasBorder,
  fixedHeight,
  buttonWidth,
  buttonHeight,
  textFieldStyle,
  colorFill,
}: CustomColorAlphaPickerProps) => {
  const theme = useTheme();
  const getColorValue = (selectedObject, colorFill) => {
    // Determine the property to handle based on colorFill
    const colorProperty = colorFill ? "fill" : "stroke";

    // Handle the case for 'IText' type
    if (selectedObject && selectedObject.type === "IText") {
      if (selectedObject.isEditing) {
        const cursorPositionStart = selectedObject.selectionStart;
        const cursorPositionEnd = selectedObject.selectionEnd;

        const { line } = findLineBasedOnCursosPos(
          selectedObject.text.split("\n"),
          cursorPositionStart
        );

        const hasCharTextStyling = Object.keys(selectedObject.styles).includes(
          String(line)
        );
        let charStyle;
        if (cursorPositionEnd !== cursorPositionStart) {
          charStyle = hasCharTextStyling
            ? selectedObject.styles[line][
                cursorPositionStart == 0
                  ? cursorPositionStart + 1
                  : cursorPositionStart
              ]
            : null;
        } else {
          // Assuming selectedObject.text is the string of the IText object
          // and selectedObject.styles is an array of style objects per character
          charStyle = hasCharTextStyling
            ? selectedObject.styles[line][
                cursorPositionStart == 0
                  ? cursorPositionStart
                  : cursorPositionStart - 1
              ]
            : null;
        }

        if (charStyle && charStyle[colorProperty]) {
          return charStyle[colorProperty];
        } else {
          return colorFill ? "#000000FF" : "#FFFFFFFF"; // Fallback to default fill or stroke
        }
      }
    } else if (
      selectedObject?.type == "Multimedia" ||
      selectedObject?.type == "QRCode"
    ) {
      const objects = selectedObject._objects;
      return colorFill ? objects[0].fill : objects[0].stroke;
    }
    // Return the color value from the fill or stroke property
    return selectedObject[colorProperty];
  };
  let objColorValues = selectedObject
    ? getColorValue(selectedObject, colorFill)
    : "";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "60% 25%",
        alignItems: "center",
        justifyItems: "start",
        alignContent: "center",
      }}
    >
      <ColorPicker
        value={objColorValues}
        onChange={onColorChange}
        mode="rgba"
        pickerWidth={190}
        hasBorder={hasBorder}
        textFieldStyle={{
          border: `1px solid ${theme.palette.background.defaultLight}`,
          ...textFieldStyle,
        }}
        fixedHeight={fixedHeight}
        buttonWidth={buttonWidth}
        buttonHeight={buttonHeight}
      />
      <CustomTextField
        fixedHeight={fixedHeight}
        style={textFieldStyle}
        disabled
        value={`${Math.round(
          (parseInt(objColorValues?.slice(-2), 16) / 255) * 100
        )}%`}
      />
    </div>
  );
};

export default CustomColorAlphaPicker;
