import React, { useEffect, useState } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ButtonGroup,
  Button,
} from "@mui/material";
import { makeStyles } from "tss-react/mui";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import DynamicText from "./DynamicText";
import TextfieldSelector from "../../../../components/Select/TextfieldSelector";
import { Grid2 } from "@mui/material";
import { useTranslation } from "../../translationUtils";
import { fontFamilyOptions } from "../FabricHandlers/FontUtils";

const useStyles = makeStyles()((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  buttonGroup: {
    margin: theme.spacing(1),
  },
}));

export const findLineBasedOnCursosPos = (textLines, cursorPos) => {
  let cumulativeLength = 0;
  let line = 0;
  let startLineIdx = 0;
  let endLineIdx = 0;
  for (let j = 0; j < textLines.length; j++) {
    if (cursorPos <= textLines[j].length + cumulativeLength) {
      line = j;
      startLineIdx = cumulativeLength;
      endLineIdx = textLines[j].length + cumulativeLength;
      break;
    }
    cumulativeLength += textLines[j].length + 1;
  }
  return { line, startLineIdx, endLineIdx };
};

const TextEditor = ({
  canvas,
  fontFamily,
  fontSize,
  onFontFamilyChange,
  onFontSizeChange,
  bold,
  italic,
  underline,
  onBoldToggle,
  onItalicToggle,
  onUnderlineToggle,
  textAlign,
  onTextAlignChange,
  addDynamicText,
  resolution,
}) => {
  const { t } = useTranslation();
  const [textSize, setTextSize] = useState(fontSize);

  useEffect(() => {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // const activeTxtObj = canvas.getActiveObject();
    const widthRatio = resolution.width / canvasWidth;
    const heightRatio = resolution.height / canvasHeight;

    // Use the average of width and height ratios to maintain aspect ratio
    const averageRatio =
      Math.min(widthRatio, heightRatio) * canvas.viewportZoom;
    const updatedTextSize = Math.round(fontSize * averageRatio);
    setTextSize(updatedTextSize);
  }, [fontSize]);

  const addDynamicWord = (value) => {
    let cumulativeLength = 0;

    const activeObj = canvas.getActiveObject();
    const textLines = activeObj.text.split("\n");
    const { line, startLineIdx, endLineIdx } = findLineBasedOnCursosPos(
      textLines,
      activeObj.selectionStart
    );

    let start = activeObj.selectionStart + 1;
    let stop = activeObj.selectionStart + value.length;
    let newStyles = {};

    //check if exists style in the line
    if (
      !!activeObj.styles[line] &&
      Object.keys(activeObj.styles[line]).length > 0
    ) {
      //transpose styling based on the length of the word added
      const stylesKeys = Object.keys(activeObj.styles[line] || {});
      stylesKeys.forEach((key) => {
        const intKey = parseInt(key, 10);
        if (intKey >= start - 1 - startLineIdx) {
          let newKey = intKey;
          // Adjust style indices for remaining text
          newKey += value.length + 2;
          newStyles = Object.assign(newStyles, {
            [newKey]: activeObj.styles[line][key],
          });
        } else {
          newStyles = Object.assign(newStyles, {
            [intKey]: activeObj.styles[line][key],
          });
        }
      });
    }
    //add styling to the position of the dynamic word
    for (let i = 0; i <= textLines[line].length + value.length + 2; i++) {
      if (i >= start - startLineIdx && i <= stop - startLineIdx) {
        newStyles = Object.assign(newStyles, {
          [i]: { textBackgroundColor: "#CDD0D6", type: "dynamic" },
        });
      }
    }
    activeObj.styles[line] = newStyles;
    addDynamicText(value, null);
  };

  const fontSizeOptions = [
    { label: "10", value: 10 },
    { label: "11", value: 11 },
    { label: "12", value: 12 },
    { label: "13", value: 13 },
    { label: "14", value: 14 },
    { label: "15", value: 15 },
    { label: "16", value: 16 },
    { label: "20", value: 20 },
    { label: "24", value: 24 },
    { label: "32", value: 32 },
    { label: "36", value: 36 },
    { label: "40", value: 40 },
    { label: "48", value: 48 },
    { label: "64", value: 64 },
    { label: "72", value: 72 },
    { label: "80", value: 80 },
    { label: "96", value: 96 },
    { label: "128", value: 128 },
  ];
  const { classes } = useStyles();
  return (
    <Grid2 container style={{ display: "flex" }} size={12}>
      <Grid2 size={12} style={{ display: "flex" }}>
        <FormControl
          variant="outlined"
          className={classes.formControl}
          style={{ width: "100%" }}
        >
          <TextfieldSelector
            importFonts={true}
            freeSolo={true}
            value={fontFamily}
            options={fontFamilyOptions}
            label={t("DesignerTranslations.t.fontFamily")}
            type="string"
            onChange={onFontFamilyChange}
            textfieldProps={{
              sx: {
                "& .MuiInputBase-root": {
                  fontFamily: fontFamily,
                },
              },
            }}
            renderOption={(props, option) => {
              return (
                <li {...props} key={option.value}>
                  <span style={{ fontFamily: option.value as string }}>
                    {option.label}
                  </span>
                </li>
              );
            }}
          />
        </FormControl>
      </Grid2>
      <Grid2 size={12} style={{ display: "flex" }}>
        <FormControl variant="outlined" className={classes.formControl}>
          <TextfieldSelector
            freeSolo={true}
            value={textSize}
            options={fontSizeOptions}
            label="Font Size"
            type="number"
            onChange={onFontSizeChange}
          />
        </FormControl>
      </Grid2>
      <Grid2 size={12} style={{ display: "flex" }}>
        <ButtonGroup
          color="primary"
          aria-label="text editor text decoration buttons"
          className={classes.buttonGroup}
        >
          <Button
            onClick={onBoldToggle}
            variant={bold ? "contained" : "outlined"}
          >
            <FormatBoldIcon />
          </Button>
          <Button
            onClick={onItalicToggle}
            variant={italic ? "contained" : "outlined"}
          >
            <FormatItalicIcon />
          </Button>
          <Button
            onClick={onUnderlineToggle}
            variant={underline ? "contained" : "outlined"}
          >
            <FormatUnderlinedIcon />
          </Button>
        </ButtonGroup>
      </Grid2>
      <Grid2 size={12} style={{ display: "flex" }}>
        <ButtonGroup
          color="primary"
          aria-label="text editor text alignment buttons"
          className={classes.buttonGroup}
        >
          <Button
            onClick={() => onTextAlignChange("left")}
            variant={textAlign === "left" ? "contained" : "outlined"}
          >
            <FormatAlignLeftIcon />
          </Button>
          <Button
            onClick={() => onTextAlignChange("center")}
            variant={textAlign === "center" ? "contained" : "outlined"}
          >
            <FormatAlignCenterIcon />
          </Button>
          <Button
            onClick={() => onTextAlignChange("right")}
            variant={textAlign === "right" ? "contained" : "outlined"}
          >
            <FormatAlignRightIcon />
          </Button>
        </ButtonGroup>
      </Grid2>
      <DynamicText addDynamicText={addDynamicWord} classes={classes} />
    </Grid2>
  );
};

export default TextEditor;
