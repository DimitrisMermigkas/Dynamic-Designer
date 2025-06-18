import React, { useRef, useEffect } from "react";
import { BlockPicker, SketchPicker } from "react-color";
import {
  Button,
  TextField,
  InputAdornment,
  Tooltip,
  Popover,
} from "@mui/material";
import styled from "styled-components";
import { makeStyles } from "tss-react/mui";

import CustomTextField from "../TextFields/CustomTextField";
import { isMobile } from "react-device-detect";
import tinycolor from "tinycolor2";

const PopoverDiv = styled.div`
  position: absolute;
  z-index: 2;
`;

const CoverDiv = styled.div`
  position: fixed;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
`;

const useStyles = makeStyles()({
  textfieldBorder: {
    border: "none",
  },
  colorTextField: {
    borderRadius: "8px",
    width: "100%",
    flexGrow: 0.85,
    marginBlockEnd: "10px",
  },
});

type ColorPickerProps = {
  value?: any;
  onChange?: any;
  buttonWidth?: any;
  buttonHeight?: any;
  disableAlpha?: any;
  textFieldStyle?: any;
  type?: any;
  mode?: any;
  pickerWidth?: any;
  hasBorder?: any;
  fixedHeight?: any;
  borderOnColor?: any;
};

/**
 * Component to pick a color. A button is provided, which when clicked opens a popup to select the button's color.
 *
 * @component
 */
function ColorPicker({
  value,
  onChange,
  buttonWidth,
  buttonHeight,
  disableAlpha,
  textFieldStyle,
  type,
  mode,
  pickerWidth,
  hasBorder,
  fixedHeight,
  borderOnColor,
}: ColorPickerProps) {
  const { classes } = useStyles();

  const extractValuesFromRGBA = (rgbaString) => {
    // Use tinycolor to parse the RGBA string
    const color = tinycolor(rgbaString);

    // Check if the color is valid
    if (!color.isValid()) {
      console.error("Invalid RGBA string:", rgbaString);
      return null;
    }

    // Get the hex value and alpha
    const hexColor = color.toHexString();
    const alpha = color.getAlpha();

    // Construct the RGBA hex string
    const rgbaHex = color.toHex8String();

    return {
      alpha,
      hexColor,
      rgbaHex,
    };
  };

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [displayColor, setDisplayColor] = React.useState(value);
  const [anchorEl, setAnchorEl] = React.useState(null);

  useEffect(() => {
    if (value) {
      const color = tinycolor(value);
      const hexColor = color.toHexString();
      setDisplayColor(hexColor);
    }
  }, [value]);

  const color = {
    hex: value,
  };

  const handleClose = (e) => {
    e.preventDefault();
    setDialogOpen(false);
  };
  const onButtonClick = (event) => {
    setDialogOpen(!dialogOpen);
    setAnchorEl(event.currentTarget);
  };

  return (
    <div>
      {type === "button" ? (
        <Tooltip title="Select Color">
          <Button
            style={{
              backgroundColor: value,
              minWidth: buttonWidth,
              height: buttonHeight,
              border: borderOnColor ? "1px solid #ffffff1a" : null,
            }}
            onClick={onButtonClick}
          />
        </Tooltip>
      ) : (
        <CustomTextField
          disabled
          value={displayColor}
          variant="outlined"
          classes={{ root: classes.colorTextField }}
          fixedHeight={fixedHeight ? fixedHeight : "44px"}
          style={textFieldStyle}
          hasBorder={hasBorder}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment
                  position="start"
                  className={classes.textfieldBorder}
                >
                  <Tooltip title="Select Color">
                    <Button
                      style={{
                        backgroundColor: value,
                        minWidth: buttonWidth,
                        height: buttonHeight,
                        border: borderOnColor ? "1px solid #ffffff1a" : null,
                      }}
                      onClick={onButtonClick}
                    />
                  </Tooltip>
                </InputAdornment>
              ),
            },
          }}
        />
      )}
      <Popover
        open={dialogOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <SketchPicker
          width={pickerWidth ? pickerWidth : undefined}
          color={color}
          triangle="hide"
          onChange={(value) => {
            if (mode === "rgba") {
              // const rgbaColor = `rgb(${value.rgb.r}, ${value.rgb.g}, ${value.rgb.b}, ${value.rgb.a})`;
              const { hexColor, alpha, rgbaHex } = extractValuesFromRGBA(
                value.rgb
              );
              setDisplayColor(hexColor);
              onChange && onChange(rgbaHex);
            } else {
              setDisplayColor(value.hex);
              onChange && onChange(value.hex);
            }
          }}
          onClick={onButtonClick}
          disableAlpha={disableAlpha}
        />
      </Popover>
    </div>
  );
}

ColorPicker.defaultProps = {
  buttonWidth: "32px",
  buttonHeight: "32px",
};

export default ColorPicker;
