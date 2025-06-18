import {
  FormControlLabel,
  Input,
  MenuItem,
  Popover,
  Select,
  Slider,
  Typography,
  useTheme,
} from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { withStyles } from "tss-react/mui";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CustomStyledCheckBox from "../../../../components/CheckBoxes/CustomStyledCheckBox";
import SelectFromObject from "../../../../components/Select/SelectFromObject";
import CustomTextField from "../../../../components/TextFields/CustomTextField";
import React, { useEffect } from "react";
import Angle from "../../../../static/images/angle.svg";
import Connect from "../../../../static/images/connect.svg";
import StrokeWidth from "../../../../static/images/strokeWidth.svg";
import ElementsSchema from "../CustomElements/ElementsSchema";
import useObjectCustomizationHandlers from "../FabricHandlers/ObjectCustomization.handlers";
import useOptionsHandlers from "../FabricHandlers/Options.handlers";
import ButtonOutlined from "./ButtonOutlined";
import CustomColorAlphaPicker from "./CustomColorAlphaPicker";
import CustomElementsEditor from "./CustomElementsEditor";
import MultimediaEditor from "./MultimediaEditor";
import TextEditor from "./TextEditor";
import TriggerEventEditor from "./TriggerEventEditor";
import { useTranslation } from "../../translationUtils";

const Accordion = withStyles(MuiAccordion, (_theme, _params, classes) => ({
  root: {
    border: "1px solid rgba(0, 0, 0, .425)",
    boxShadow: "none",
    width: "100%",
    "&:not(:last-child)": {
      borderBottom: 0,
    },
    "&:before": {
      display: "none",
    },
    [`&.${classes.expanded}`]: {
      margin: 0,
    },
  },
  expanded: {},
}));

const AccordionSummary = withStyles(
  MuiAccordionSummary,
  (_theme, _params, classes) => ({
    root: {
      backgroundColor: "rgba(0, 0, 0, .03)",
      borderBottom: "1px solid rgba(0, 0, 0, .125)",
      marginBottom: -1,
      [`&.${classes.expanded}`]: { minHeight: "unset" },
    },
    content: {
      margin: "0",
      [`&.${classes.expanded}`]: {
        margin: "0",
      },
    },
    expanded: {},
  })
);

const AccordionDetails = withStyles(MuiAccordionDetails, (theme) => ({
  root: {
    display: "unset",
    padding: "8px 16px",
  },
}));

const CustomSlider = withStyles(Slider, (theme, _params, classes) => ({
  root: {
    color: theme.palette.primary.main,
    height: 8,
  },
  thumb: {
    height: 24,
    width: 24,
    backgroundColor: "#fff",
    border: "2px solid currentColor",
    marginTop: -8,
    marginLeft: -12,
    [`&:focus, &:hover, &.${classes.active}`]: {
      boxShadow: "inherit",
    },
  },
  active: {},
  valueLabel: {
    left: "calc(-50% + 4px)",
    color: theme.palette.primary.main,
  },
  track: {
    height: 8,
    borderRadius: 4,
  },
  rail: {
    height: 8,
    borderRadius: 4,
  },
}));

const useStyles = makeStyles()((theme) => ({
  underline: {
    "&::before": {
      border: "none",
    },
    "&::after": {
      border: "none",
    },
    "&&:hover::before": {
      border: "none",
    },
  },
  inputRoot: {
    border: `1px solid ${theme.palette.text.secondary}`,
    borderRadius: "8px",
    paddingLeft: "8px",
  },
}));

const EditorMapper = ({
  canvas,
  selectedDesign,
  screenIndex,
  type,
  selectedObject,
  setSelectedObject,
  aspectRatio,
  handleChangeAspectRatio,
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
  t,
}) => {
  let index;
  const fields = ElementsSchema({ type: type, t: t });
  const componentMap = [
    {
      component: MultimediaEditor,
      props: {
        aspectRatio,
        handleChangeAspectRatio,
      },
    },
    {
      component: TextEditor,
      props: {
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
      },
    },
    {
      component: CustomElementsEditor,
      props: {
        fields,
        selectedObject,
        setSelectedObject,
        canvas,
        selectedDesign,
        screenIndex,
        t,
      },
    },
  ] as const;

  if (type == "Multimedia") index = 0;
  else if (type == "IText") index = 1;
  else if (
    type == "RSSFeed" ||
    type == "Button" ||
    type == "Weather" ||
    type == "Embed" ||
    "QRCode"
  )
    index = 2;
  // else if (type == "QRCode") index = 3;
  const selectedTab = componentMap[index];

  if (!selectedTab) {
    return null; // or render a default component/error message
  }

  const { component: SelectedComponent, props } = selectedTab;

  //TODO Remove ts-ignore
  //@ts-ignore
  return <SelectedComponent {...props} />;
};

const ObjectOptions = ({
  canvas,
  selectedDesign,
  selectedObject,
  setSelectedObject,
  screenIndex,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { classes } = useStyles();

  const {
    libraryDialogOpen,
    handleLibraryDialogClose,
    openPlaylistDialog,
    handleClosePlaylistDialog,
  } = useOptionsHandlers({ canvas, selectedDesign, screenIndex });

  const {
    setFontSize,
    setFontFamily,
    setTextAlignment,
    setTextStyle,
    setTextColor,
    setBackgroundColor,
    setStrokeColor,
    setOpacity,
    setAngle,
    setColorOpacity,
    setStrokeWidth,
    setRadius,
    updateObjectModification,
    objectHeight,
    objectLeft,
    objectTop,
    objectWidth,
    setTextFieldValues,
    onBlurTextfield,
    objectAngle,
    objectColor,
    addDynamicText,
    objectName,
    changeName,
    aspectRatio,
    handleChangeAspectRatio,
    handleObjectFullscreen,
    objFullscreen,
    pxToPercentage,
    setPxToPercentage,
    anchorEl,
    handleClosePopover,
    handleOpenPopover,
    toggleBtnGroupFont,
  } = useObjectCustomizationHandlers({
    canvas,
    setSelectedObject,
    selectedObject,
    selectedDesign,
    screenIndex,
  });

  useEffect(() => {
    if (canvas) {
      canvas.on("object:modified", function (e) {
        // Trigger a state change
        let modifiedObject = e.target;
        if (
          modifiedObject.type !== "group"
          // &&
          // modifiedObject.type !== "activeSelection"
        ) {
          if (
            (modifiedObject.id == "pointer-1" ||
              modifiedObject.id == "pointer-2") &&
            modifiedObject.isPoint
          ) {
            const line = canvas
              .getObjects()
              .find(
                (o) => o.id == modifiedObject.referenceId && o.type == "Line"
              );
            modifiedObject = line;
          }
          updateObjectModification(
            modifiedObject,
            pxToPercentage,
            selectedDesign,
            screenIndex
          );
        }
      });
    }
  }, [canvas, pxToPercentage]);

  const handleSelectedObjectChange = (key, value) => {
    if (key == "fontFamily") {
      setFontFamily(value);
    } else if (key == "fontSize") {
      setFontSize(value);
    } else if (key == "textAlign") {
      setTextAlignment(value);
    } else if (key == "fill") {
      setTextColor(value);
    } else if (key == "stroke") {
      setStrokeColor(value);
      if (!selectedObject.strokeWidth) {
        setSelectedObject((prevObject) => ({
          ...prevObject,
          strokeWidth: 1,
        }));
        setStrokeWidth(1);
      }
    } else if (key == "backgroundColor") {
      setBackgroundColor(value);
    } else if (key == "strokeWidth") {
      setSelectedObject((prevObject) => ({
        ...prevObject,
        strokeWidth: value,
      }));
      setStrokeWidth(value);
    } else if (key == "opacity") {
      setOpacity(value);
    } else if (key == "angle") {
      setAngle(value);
    } else if (key == "radius") {
      setRadius(value);
    }
    if (key == "radius") {
      setSelectedObject((prevObject) => ({
        ...prevObject,
        rx: value,
        ry: value,
      }));
    } else {
      setSelectedObject((prevObject) => ({
        ...prevObject,
        [key]: value,
      }));
    }
  };

  const handleSelectedObjectToggle = (key, value) => {
    if (key == "bold") {
      setTextStyle("fontWeight", value ? "bold" : "normal");
    } else if (key == "italic") {
      setTextStyle("fontStyle", value ? "italic" : "normal");
    } else if (key == "underline") {
      setTextStyle("underline", value);
    }
    // setSelectedObject((prevObject) => ({
    //   ...prevObject,
    //   [key]: value,
    // }));
  };

  const checkifObjCanFillStroke = (selectedObject) => {
    if (
      selectedObject?.superType == "Multimedia" ||
      // selectedObject?.type == "QRCode" ||
      (selectedObject?.type == "IText" && selectedObject?.isEditing)
    ) {
      return true;
    } else {
      if (
        !selectedObject?.superType &&
        selectedObject?.type !== "IText" &&
        selectedObject.type !== "activeSelection"
      )
        return true;
      else return false;
    }
  };

  const objectWithFillStrokeSettings = checkifObjCanFillStroke(selectedObject);

  return (
    <>
      <div
        style={{
          padding: "8px 16px",
          display: "flex",
          flexDirection: "column",
          rowGap: "8px",
        }}
      >
        {selectedObject && (
          <>
            <div style={{ display: "flex" }}>
              <CustomTextField
                label="Name"
                value={objectName}
                onChange={(e) => changeName(e.target.value)}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "78% 22%",
                rowGap: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  rowGap: "8px",
                }}
              >
                <div
                  style={{
                    width: "90%",
                    display: "flex",
                    columnGap: "16px",
                  }}
                >
                  <CustomTextField
                    label="X"
                    type="number"
                    hasArrows={false}
                    value={objectLeft}
                    hasBorder={true}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onBlurTextfield("left");
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    onBlur={(e) => onBlurTextfield("left")}
                    onChange={(e) => {
                      setTextFieldValues("left", e.target.value);
                    }}
                  />
                  <CustomTextField
                    label="Y"
                    type="number"
                    hasArrows={false}
                    value={objectTop}
                    hasBorder={true}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onBlurTextfield("top");
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    onBlur={(e) => onBlurTextfield("top")}
                    onChange={(e) => {
                      setTextFieldValues("top", e.target.value);
                    }}
                  />
                </div>
                <div
                  style={{
                    width: "90%",
                    display: "flex",
                    columnGap: "16px",
                  }}
                >
                  <CustomTextField
                    label={t("DesignerTranslations.t.width")}
                    type="number"
                    hasArrows={false}
                    value={objectWidth}
                    hasBorder={true}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onBlurTextfield("width");
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    onBlur={(e) => onBlurTextfield("width")}
                    onChange={(e) => {
                      setTextFieldValues("width", e.target.value);
                    }}
                  />
                  <CustomTextField
                    label={t("DesignerTranslations.t.height")}
                    type="number"
                    hasArrows={false}
                    value={objectHeight}
                    hasBorder={true}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onBlurTextfield("height");
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    onBlur={(e) => onBlurTextfield("height")}
                    onChange={(e) => {
                      setTextFieldValues("height", e.target.value);
                    }}
                  />
                </div>
              </div>
              <SelectFromObject
                style={{
                  minWidth: "unset",
                  width: "100%",
                  justifyContent: "flex-end",
                }}
                fixedHeight={36}
                options={[
                  { value: "pixels", label: "px" },
                  { value: "percentage", label: "%" },
                ]}
                value={!pxToPercentage ? "pixels" : "percentage"}
                onChange={(value) => {
                  if (value == "pixels") setPxToPercentage(false);
                  else setPxToPercentage(true);
                }}
              />
            </div>
            {selectedObject && selectedObject?.type !== "Line" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "78% 22%",
                }}
              >
                <div
                  style={{
                    width: "90%",
                    display: "flex",
                    columnGap: "16px",
                  }}
                >
                  <ButtonOutlined
                    btnStyle={{
                      border: `1px solid ${theme.palette.text.secondary}`, // Replace with your theme palette color
                      paddingInline: 0,
                      justifyContent: "space-around",
                      display: "flex",
                      minWidth: "92px",
                      borderRadius: "10px",
                    }}
                    onClick={handleOpenPopover("angle", 0, 359)}
                    component={Angle}
                    text={objectAngle}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    opacity: 0,
                  }}
                >
                  <img src={Connect} alt="connect" style={{ width: "20px" }} />
                </div>
              </div>
            )}
            {selectedObject && selectedObject?.type == "Multimedia" && (
              <FormControlLabel
                control={
                  <CustomStyledCheckBox
                    checked={objFullscreen}
                    onChange={(e) =>
                      handleObjectFullscreen(e.currentTarget.checked)
                    }
                  />
                }
                label={t("DesignerTranslations.t.fullscreen")}
                labelPlacement="start"
              />
            )}
          </>
        )}
      </div>
      {((selectedObject?.superType && selectedObject?.type !== "Line") ||
        selectedObject?.type == "IText") && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography
              style={{
                fontSize: "12px",
                color: theme.palette.text.secondary,
              }}
            >
              {selectedObject.type == "IText"
                ? `Text ${t("GeneralTranslations.t.settings")}`
                : `${selectedObject.type} ${t(
                    "GeneralTranslations.t.settings"
                  )}`}
            </Typography>
          </AccordionSummary>
          <AccordionDetails style={{ display: "flex" }}>
            <EditorMapper
              canvas={canvas}
              selectedDesign={selectedDesign}
              screenIndex={screenIndex}
              type={selectedObject.type}
              selectedObject={selectedObject}
              setSelectedObject={setSelectedObject}
              aspectRatio={aspectRatio}
              handleChangeAspectRatio={handleChangeAspectRatio}
              fontFamily={selectedObject.fontFamily}
              fontSize={selectedObject.fontSize}
              onFontFamilyChange={(value) =>
                handleSelectedObjectChange("fontFamily", value)
              }
              onFontSizeChange={(value) =>
                handleSelectedObjectChange("fontSize", value)
              }
              bold={toggleBtnGroupFont?.bold}
              italic={toggleBtnGroupFont?.italic}
              underline={toggleBtnGroupFont?.underline}
              onBoldToggle={() =>
                handleSelectedObjectToggle("bold", !toggleBtnGroupFont?.bold)
              }
              onItalicToggle={() =>
                handleSelectedObjectToggle(
                  "italic",
                  !toggleBtnGroupFont?.italic
                )
              }
              onUnderlineToggle={() =>
                handleSelectedObjectToggle(
                  "underline",
                  !toggleBtnGroupFont?.underline
                )
              }
              textAlign={selectedObject.textAlign}
              onTextAlignChange={(value) =>
                handleSelectedObjectChange("textAlign", value)
              }
              addDynamicText={addDynamicText}
              resolution={{
                width:
                  selectedDesign.Configuration.screens[screenIndex].resolution
                    .width,
                height:
                  selectedDesign.Configuration.screens[screenIndex].resolution
                    .height,
              }}
              t={t}
            />
          </AccordionDetails>
        </Accordion>
      )}
      {objectWithFillStrokeSettings && (
        <>
          {selectedObject?.type !== "Line" && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  style={{
                    fontSize: "12px",
                    color: theme.palette.text.secondary,
                  }}
                >
                  {t("DesignerTranslations.t.fill")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div
                  style={{
                    paddingInline: "16px",
                    display: "flex",
                    flexDirection: "column",
                    rowGap: "8px",
                  }}
                >
                  <CustomColorAlphaPicker
                    onColorChange={(value) =>
                      handleSelectedObjectChange("fill", value)
                    }
                    selectedObject={selectedObject}
                    fixedHeight={31}
                    buttonHeight={24}
                    buttonWidth={24}
                    textFieldStyle={{ height: "31px", marginBlockEnd: 0 }}
                    colorFill={true}
                  />
                </div>
              </AccordionDetails>
            </Accordion>
          )}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography
                style={{
                  fontSize: "12px",
                  color: theme.palette.text.secondary,
                }}
              >
                {t("DesignerTranslations.t.stroke")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              style={{ flexDirection: "column", rowGap: "8px" }}
            >
              <div
                style={{
                  paddingInline: "16px",
                  display: "flex",
                  flexDirection: "column",
                  rowGap: "8px",
                }}
              >
                <CustomColorAlphaPicker
                  onColorChange={(value) =>
                    handleSelectedObjectChange("stroke", value)
                  }
                  selectedObject={selectedObject}
                  buttonHeight={24}
                  buttonWidth={24}
                  fixedHeight={31}
                  textFieldStyle={{ height: "31px", marginBlockEnd: 0 }}
                />
                <Select
                  variant="standard"
                  style={{
                    border: `1px solid ${theme.palette.text.secondary}`,
                    borderRadius: "8px",
                    paddingLeft: "8px",
                    display: "flex",
                    paddingBlock: 0,
                    minHeight: "31px",
                    width: "fit-content",
                  }}
                  // Set the initial value
                  value={selectedObject?.strokeWidth}
                  onChange={(e) =>
                    handleSelectedObjectChange("strokeWidth", e.target.value)
                  }
                  displayEmpty
                  input={
                    <Input
                      classes={{
                        underline: classes.underline,
                        root: classes.inputRoot,
                      }}
                    />
                  }
                  renderValue={() => (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <img
                        src={StrokeWidth}
                        alt="strokeWidth"
                        style={{ marginRight: 8, width: 24, height: 24 }}
                      />
                      <Typography>
                        {selectedObject?.type == "Multimedia"
                          ? selectedObject?._objects[0].strokeWidth
                            ? `${selectedObject?._objects[0].strokeWidth}px`
                            : `Borderless`
                          : selectedObject?.strokeWidth
                          ? `${selectedObject?.strokeWidth}px`
                          : `Borderless`}
                      </Typography>
                    </div>
                  )}
                >
                  <MenuItem value={""}>Borderless</MenuItem>
                  <MenuItem value={"1"}>1px</MenuItem>
                  <MenuItem value={"2"}>2px</MenuItem>
                  <MenuItem value={"3"}>3px</MenuItem>
                </Select>
              </div>
            </AccordionDetails>
          </Accordion>
        </>
      )}
      {selectedObject && selectedObject?.type == "Button" && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography
              style={{
                fontSize: "12px",
                color: theme.palette.text.secondary,
              }}
            >
              {t("DesignerTranslations.t.triggerEvents")}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TriggerEventEditor
              canvas={canvas}
              selectedObject={selectedObject}
              setSelectedObject={setSelectedObject}
              screenIndex={screenIndex}
              selectedDesign={selectedDesign}
            />
          </AccordionDetails>
        </Accordion>
      )}
      <Popover
        open={!!anchorEl?.anchor}
        anchorEl={anchorEl?.anchor}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          style: {
            width: "12%",
            height: "5%",
            paddingBottom: "8px",
            padding: "16px",
            display: "flex",
            alignItems: "flex-end",
          },
        }}
      >
        {anchorEl?.component == "angle" && (
          <CustomSlider
            value={objectAngle}
            valueLabelDisplay="auto"
            aria-label="pretto slider"
            min={anchorEl?.min}
            max={anchorEl?.max}
            step={1}
            onChange={setAngle}
          />
        )}
        {anchorEl?.component == "fill" && (
          <CustomSlider
            value={objectColor.fillAlpha}
            valueLabelDisplay="auto"
            aria-label="pretto slider"
            min={anchorEl?.min}
            max={anchorEl?.max}
            step={1}
            onChange={setColorOpacity("fill")}
          />
        )}
        {anchorEl?.component == "stroke" && (
          <CustomSlider
            value={objectColor.strokeAlpha}
            valueLabelDisplay="auto"
            aria-label="pretto slider"
            min={anchorEl?.min}
            max={anchorEl?.max}
            step={1}
            onChange={setColorOpacity("stroke")}
          />
        )}
      </Popover>
    </>
  );
};

export default ObjectOptions;
