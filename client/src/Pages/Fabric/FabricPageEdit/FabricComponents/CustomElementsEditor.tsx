import {
  Button,
  FormControlLabel,
  Grid2,
  InputLabel,
  MenuItem,
  Select,
  Slider,
} from "@mui/material";
import React, { useState } from "react";
import { makeStyles } from "tss-react/mui";
import { Radio, RadioGroup } from "@mui/material";
import CustomStyledCheckBox from "../../../../components/CheckBoxes/CustomStyledCheckBox";
import ColorPicker from "../../../../components/ColorPicker/ColorPicker";
import CustomIconButton from "../../../../components/CustomButtons/IconButton";
import AutocompleteVirtualized from "../../../../components/Select/AutocompleteVirtualized";
import SelectFromObjectNoFromControl from "../../../../components/Select/SelectFromObjectNoFormControl";
import TextfieldSelector from "../../../../components/Select/TextfieldSelector";
import CustomTextField from "../../../../components/TextFields/CustomTextField";
import { deepEqual } from "fast-equals";
import { groupBy } from "lodash";
import { useTranslation } from "../../translationUtils";
import { FabricElementOptionSchema } from "../CustomElements/ElementsSchema";
import {
  convertStaticDynamicQRText,
  handleNumberChange,
  handleStringChange,
} from "../CustomElements/QRCodeEditor";
import CustomItemsPicker from "../FabricItemsSchema/CustomItemsPicker";
import { createSnapshotOfElement } from "./CustomElementsHelper";
import PreviewElementDialog from "./PreviewElementDialog";

const useStyles = makeStyles()(() => ({
  formControlLabel: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    "&.MuiFormControlLabel-labelPlacementStart": {
      marginLeft: 0,
    },
  },
  selectOutlined: {
    marginLeft: 0,
    width: "100%",
  },
  selectedObjectLabel: {
    justifyContent: "space-between",
    width: "100%",
    marginLeft: 0,
  },
}));

const initializeSettings = (
  fields: FabricElementOptionSchema[],
  selectedObject
) => {
  const initialValues = {};
  fields.forEach((field) => {
    if (field?.name) initialValues[field.name] = field.initValue;
  });
  const { size, currentWidth, currentHeight, ...restObjectSettings } =
    selectedObject.settings || {};
  const settingsValues = !deepEqual(initialValues, restObjectSettings)
    ? restObjectSettings
    : initialValues;

  return {
    ...settingsValues,
    size: {
      width: selectedObject.width,
      height: selectedObject.height,
    },
    objID: selectedObject.id, // add the objID here
  };
};

type CustomElementsEditorProps = {
  fields: FabricElementOptionSchema[];
  selectedObject;
  setSelectedObject;
  canvas;
  selectedDesign;
  screenIndex: number;
  g;
};

const renderDynamicDeviceDetails = (
  index,
  selectedObject,
  handleQRCodeChanges,
  settings,
  t
) => {
  return (
    index == 3 &&
    selectedObject.type == "QRCode" && (
      <Grid2 size={10}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            rowGap: "10px",
          }}
        >
          {settings.dynamicValue && settings.dynamicValue == "DeviceDetail" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                rowGap: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                }}
              >
                <div style={{ display: "flex", columnGap: "16px" }}>
                  <CustomTextField
                    placeholder="e.g., 1"
                    value={settings.numberValue}
                    type="number"
                    onChange={(e) =>
                      handleQRCodeChanges("number", e.target.value)
                    }
                  />
                  <CustomTextField
                    placeholder="e.g., RAM"
                    value={settings.stringValue}
                    onChange={(e) =>
                      handleQRCodeChanges("string", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          )}
          {settings.dynamicValue &&
            settings.dynamicValue == "DeviceDetail" &&
            settings.showRadioGroup && (
              <RadioGroup
                value={settings.selectedRadioOption}
                onChange={(e) => handleQRCodeChanges("radio", e.target.value)}
              >
                <FormControlLabel
                  value="Label"
                  control={<Radio />}
                  label={t("DesignerTranslations.t.addLabel")}
                />
                <FormControlLabel
                  value="Value"
                  control={<Radio />}
                  label={t("DesignerTranslations.t.addValue")}
                />
              </RadioGroup>
            )}
        </div>
      </Grid2>
    )
  );
};

const CustomElementsEditor = ({
  fields,
  selectedObject,
  setSelectedObject,
  canvas,
  selectedDesign,
  screenIndex,
}: CustomElementsEditorProps) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const settings = initializeSettings(fields, selectedObject);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);

  const handleChange = (value, name: string) => {
    let updatedValue = value;
    if (
      [
        "ticketTextColor",
        "newsTextColor",
        "tickerColor",
        "newsColor",
        "backgroundColor",
        "borderColor",
        "buttonTextColor",
        "link",
      ].includes(name)
    ) {
      if (updatedValue.slice(-2) === "00") {
        // Replace the last two digits with 'ff' to make it visible
        updatedValue = updatedValue.slice(0, 4) + "ff";
      }
    }
    const updatedSettings = { ...settings, [name]: updatedValue };
    const renderObject = !["embedLink", "link"].includes(name) ? true : false;
    onApplySettings(updatedSettings, renderObject);
  };

  const handleClosePreviewDialog = () => {
    setOpenPreviewDialog(false);
  };

  const handleQRCodeChanges = (field, value) => {
    let updatedSettings = { ...settings };
    if (field == "string" || field == "number") {
      if (field === "string") {
        updatedSettings = handleStringChange(updatedSettings, value);
      } else {
        updatedSettings = handleNumberChange(updatedSettings, value);
      }
    } else if (field === "checkbox") {
      updatedSettings.typeText = value;
    } else if (field === "radio") {
      updatedSettings.selectedRadioOption = value;
    }

    if (
      (field == "string" || field == "number" || field == "radio") &&
      updatedSettings.typeText == "static"
    ) {
      onApplySettings(updatedSettings, false);
    } else if (
      updatedSettings.typeText == "static" ||
      (updatedSettings.typeText == "dynamic" &&
        updatedSettings.dynamicValue !== "DeviceDetail" &&
        updatedSettings.dynamicValue !== "") ||
      (updatedSettings.dynamicValue == "DeviceDetail" &&
        (updatedSettings.stringValue !== "" ||
          updatedSettings.selectedRadioOption !== ""))
    ) {
      onApplySettings(updatedSettings, true);
    } else {
      onApplySettings(updatedSettings, false);
    }
  };
  const handleOnClick = async (field) => {
    // if (field.groupLabel == "News Ticker Data") {
    //   try {
    //     const response = await postRequestWithToken(
    //       "/api/v1/clients/rss/getRssFeed",
    //       { url: settings[field.functionProp] }
    //     );
    //     // Extract the titles from the RSS feed
    //     const titles = response.result.map((item) => item.title);
    //     let updatedSettings = { ...settings };
    //     updatedSettings[field.name] = titles;
    //     updatedSettings.data = titles;
    //     onApplySettings(updatedSettings, true);
    //   } catch (error) {
    //     console.error("Error:", error);
    //   }
    // } else if (field.groupLabel == "Embed Style") {
    //   let updatedSettings = { ...settings };
    //   updatedSettings[field.name] = settings[field.functionProp];
    //   onApplySettings(updatedSettings, false);
    // }
  };

  const onApplySettings = (settings: object, renderObject: boolean) => {
    let newSettings = {
      ...settings,
      size: { width: null, height: null },
      data: null,
    }; // Copy the existing settings
    // Add the additional properties
    newSettings.size = {
      width: selectedObject.width,
      height: selectedObject.height,
    };

    const activeObj = canvas.getActiveObject();
    if (activeObj.type == "QRCode") {
      newSettings = convertStaticDynamicQRText(newSettings);
    }
    activeObj.set("settings", newSettings);
    setSelectedObject({ ...activeObj });
    if (renderObject) {
      canvas.discardActiveObject();
      canvas.setActiveObject(activeObj);
      const element = CustomItemsPicker({
        canvasDimension: {
          width: canvas.width / canvas.viewportZoom,
          height: canvas.height / canvas.viewportZoom,
        },
        screenDimension:
          selectedDesign.Configuration.screens[screenIndex].resolution,
        type: activeObj.type,
        data: newSettings.data,
        ...newSettings,
      });
      createSnapshotOfElement(element, activeObj, canvas, activeObj.type);
    }
    // setOpenPreviewDialog(false);
  };

  const renderField = (
    field: FabricElementOptionSchema,
    index: number,
    settings,
    classes
  ) => {
    switch (field.type) {
      case "colorPicker":
        return (
          <FormControlLabel
            className={classes.formControlLabel}
            control={
              <ColorPicker
                key={index}
                borderOnColor={true}
                type="button"
                value={settings[field.name]}
                onChange={(color) => handleChange(color, field.name)}
                mode="rgba"
                pickerWidth={190}
              />
            }
            label={field.label}
            labelPlacement="start"
          />
        );

      case "iconButton":
        return (
          <CustomIconButton onClick={() => handleOnClick(field)} size="large">
            {field.icon}
          </CustomIconButton>
        );
      case "checkbox":
        return (
          <CustomStyledCheckBox
            style={{
              padding: "3px",
            }}
            checked={settings?.typeText === field.initValue}
            onChange={(e) => {
              if (selectedObject.type == "QRCode") {
                handleQRCodeChanges(field.type, field.initValue);
              }
            }}
            value={field.initValue}
          />
        );
      case "autocomplete":
        return (
          <TextfieldSelector
            freeSolo={true}
            value={settings[field.name]}
            options={field.options}
            label={field.name}
            type={field.name == "fontSize" ? "number" : "string"}
            onChange={(e) => handleChange(e, field.name)}
          />
        );
      case "autocompleteVirtualized":
        if (selectedObject.type == "QRCode") {
          return (
            <AutocompleteVirtualized
              style={{ width: "70%" }}
              key="dynamic-text-add"
              label={field.label}
              value={settings[field.name]}
              options={field.options}
              onChange={(newValue) => {
                handleChange(newValue, field.name);
              }}
            />
          );
        } else {
          return (
            <AutocompleteVirtualized
              style={{ width: "100%" }}
              key="dynamic-text-add"
              label={field.label}
              value={settings[field.name]}
              options={field.options}
              onChange={(newValue) => {
                handleChange(newValue, field.name);
              }}
            />
          );
        }
      case "select":
        return field.label ? (
          <FormControlLabel
            className={classes.selectedObjectLabel}
            control={
              <SelectFromObjectNoFromControl
                key={index}
                value={settings[field.name]}
                style={
                  field.style || {
                    maxWidth: "80px",
                  }
                }
                sx={{ height: "32px" }}
                onChange={(event) => handleChange(event, field.name)}
                options={field.options}
              />
            }
            label={field.label}
            labelPlacement="start"
          />
        ) : (
          <SelectFromObjectNoFromControl
            key={index}
            value={settings[field.name]}
            onChange={(event) => handleChange(event, field.name)}
            options={field.options}
            sx={{ height: "32px" }}
          />
        );

      case "selectWithIcons":
        return field.label ? (
          <FormControlLabel
            className={classes.selectedObjectLabel}
            control={
              <Select
                variant="outlined"
                key={index}
                value={settings[field.name]}
                sx={{
                  "& .MuiSelect-select": {
                    display: "flex",
                    justifyContent: "space-evenly",
                    alignItems: "center",
                  },
                }}
                classes={{
                  root: classes.selectOutlined,
                }}
                onChange={(event) =>
                  handleChange(event.target.value, field.name)
                }
              >
                {field.options.map((item) => {
                  return (
                    <MenuItem
                      key={item.label}
                      style={{
                        display: "flex",
                        justifyContent: "space-evenly",
                        alignItems: "center",
                      }}
                      value={item.value}
                    >
                      {item.component}
                      {item.label}
                    </MenuItem>
                  );
                })}
              </Select>
            }
            label={field.label}
            labelPlacement="start"
          />
        ) : (
          <Select
            key={index}
            variant="outlined"
            sx={{
              "& .MuiSelect-select": {
                display: "flex",
                justifyContent: "space-evenly",
                alignItems: "center",
              },
            }}
            classes={{
              root: classes.selectOutlined,
            }}
            value={settings[field.name]}
            onChange={(event) => handleChange(event.target.value, field.name)}
          >
            {field.options.map((item) => {
              return (
                <MenuItem
                  key={item.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-evenly",
                    alignItems: "center",
                  }}
                  value={item.value}
                >
                  {item.component}
                  {item.label}
                </MenuItem>
              );
            })}
          </Select>
        );

      case "slider":
        return field.label ? (
          <FormControlLabel
            className={classes.formControlLabel}
            control={
              <Slider
                style={{ width: "70%" }}
                value={settings[field.name]}
                min={field.options.min}
                max={field.options.max}
                step={field.options.step}
                onChange={(event, value) => handleChange(value, field.name)}
                aria-labelledby="speed-slider"
              />
            }
            label={field.label}
            labelPlacement="start"
          />
        ) : (
          <Slider
            style={{ width: "70%" }}
            value={settings[field.name]}
            min={field.options.min}
            max={field.options.max}
            step={field.options.step}
            onChange={(event, value) => handleChange(value, field.name)}
            aria-labelledby="speed-slider"
          />
        );

      case "textfield":
        return (
          <CustomTextField
            variant="outlined"
            placeholder={field.label}
            label={field.label}
            value={settings[field.name]}
            onChange={(event) => handleChange(event.target.value, field.name)}
          />
        );
      default:
        return null;
    }
  };

  // Group fields by their groupLabel
  const groupedFields = groupBy(fields, "groupLabel") as Record<
    string,
    FabricElementOptionSchema[]
  >;

  if (selectedObject.id !== settings.objID) {
    return null; // or return a placeholder/error message
  }

  return (
    <Grid2 container spacing={2} alignItems="flex-start">
      {Object.entries(groupedFields).map(([groupLabel, groupFields]) => (
        <>
          <Grid2 size={12}>
            <InputLabel>{groupLabel}</InputLabel>
          </Grid2>

          {
            groupFields.reduce(
              (acc, field, index) => {
                const fieldGridWidth = Number(field.gridWidth) || 12;

                if (fieldGridWidth === 12) {
                  acc.items.push(
                    <Grid2 key={field.name} size={field.gridWidth}>
                      {renderField(field, index, settings, classes)}
                    </Grid2>
                  );
                } else {
                  // Otherwise, accumulate items and check for width sum up to 12

                  if (acc.current.length === 0) {
                    acc.current.push(
                      <Grid2 key={field.name} size={field.gridWidth}>
                        {renderField(field, index, settings, classes)}
                      </Grid2>
                    );
                    acc.widthSum += fieldGridWidth;
                  } else {
                    // Add the field and check if the width sum equals 12
                    if (acc.widthSum + fieldGridWidth <= 12) {
                      acc.current.push(
                        <Grid2 key={field.name} size={field.gridWidth}>
                          {renderField(field, index, settings, classes)}
                        </Grid2>
                      );
                      acc.widthSum += fieldGridWidth;
                    }

                    // If width sum is 12, render the combined items in a div and reset the accumulator
                    if (acc.widthSum === 12) {
                      acc.items.push(
                        <Grid2
                          key={`group-${index}`}
                          style={{ display: "flex", alignItems: "flex-end" }}
                          size={12}
                        >
                          {acc.current}
                        </Grid2>
                      );
                      acc.current = [];
                      acc.widthSum = 0;
                    }
                  }

                  // Handle cases where the field doesn't reach 12 but no further items
                  if (
                    index === groupFields.length - 1 &&
                    acc.current.length > 0
                  ) {
                    acc.items.push(
                      <Grid2
                        key={`group-${index}`}
                        style={{ display: "flex", width: "100%" }}
                        size={12}
                      >
                        {acc.current}
                      </Grid2>
                    );
                  }
                }
                // Return the accumulated state for the next iteration
                return acc;
              },
              { items: [], current: [], widthSum: 0 }
            ).items
          }

          {/* Render the dynamic device details */}
          {groupFields.map((field, index) =>
            renderDynamicDeviceDetails(
              index,
              selectedObject,
              handleQRCodeChanges,
              settings,
              t
            )
          )}
        </>
      ))}
      {selectedObject.type !== "Button" &&
        selectedObject.type !== "Weather" &&
        selectedObject.type !== "QRCode" && (
          <Grid2 size={6}>
            <Button onClick={() => setOpenPreviewDialog(true)}>
              {t("LibraryTranslations.t.Preview")}
            </Button>
          </Grid2>
        )}
      {openPreviewDialog &&
        selectedObject.type !== "Button" &&
        selectedObject.type !== "Weather" &&
        selectedObject.type !== "QRCode" && (
          <PreviewElementDialog
            settings={settings}
            selectedObject={selectedObject}
            open={openPreviewDialog}
            onClose={handleClosePreviewDialog}
            canvas={canvas}
            selectedDesign={selectedDesign}
            screenIndex={screenIndex}
          />
        )}
    </Grid2>
  );
};

export default CustomElementsEditor;
