import AutocompleteVirtualized from "../../../../components/Select/AutocompleteVirtualized";
import AddIcon from "@mui/icons-material/Add";
import React, { useState } from "react";
import {
  Typography,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import CustomTextField from "../../../../components/TextFields/CustomTextField";
import CustomIconButton from "../../../../components/CustomButtons/IconButton";
import { useTranslation } from "../../translationUtils";

const DynamicText = ({ addDynamicText, classes }) => {
  const { t } = useTranslation();
  const [dynamicValue, setDynamicValue] = useState(null);
  const [numberValue, setNumberValue] = useState("");
  const [stringValue, setStringValue] = useState("");
  const [showRadioGroup, setShowRadioGroup] = useState(false);
  const [selectedRadioOption, setSelectedRadioOption] = useState("Label");

  const handleDisableAdd = () => {
    if (dynamicValue == "DeviceDetail") {
      if (numberValue !== "" || stringValue !== "") return false;
      else return true;
    } else if (dynamicValue !== null) {
      return false;
    } else return true;
  };

  const handleAddButton = () => {
    if (dynamicValue == "DeviceDetail") {
      let customProperty = "";
      if (numberValue)
        customProperty = `Detail-${numberValue}:${selectedRadioOption}`;
      else customProperty = `Detail:${stringValue}`;
      addDynamicText(customProperty);
    } else {
      addDynamicText(dynamicValue);
    }
  };

  const handleNumberChange = (event) => {
    if (event.target.value !== "") {
      setStringValue("");
      setShowRadioGroup(true);
    } else {
      setShowRadioGroup(false);
    }
    setNumberValue(event.target.value);
  };

  const handleStringChange = (event) => {
    if (event.target.value !== "") {
      setNumberValue("");
    } else {
      setShowRadioGroup(false);
    }
    setStringValue(event.target.value);
  };

  const handleRadioChange = (event) => {
    setSelectedRadioOption(event.target.value);
  };

  const dynamicParameters = [
    // { label: "DeviceName", value: "DeviceName" },
    { label: "DeviceDescription", value: "DeviceDescription" },
    { label: "DeviceCode", value: "DeviceCode" },
    // { label: "BranchName", value: "BranchName" },
    { label: "BranchCode", value: "BranchCode" },
    { label: "Price", value: "Price" },
    { label: "ButlerPrice", value: "ButlerPrice" },
    { label: "StorePrice", value: "StorePrice" },
    { label: "DeviceDetail", value: "DeviceDetail" },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        rowGap: "8px",
        width: "100%",
      }}
      className={classes.formControl}
    >
      <Typography>{t("DesignerTranslations.t.dynamicParameters")}</Typography>
      <AutocompleteVirtualized
        style={{ width: "100%" }}
        key="dynamic-text-add"
        label="Parameter to show"
        value={dynamicValue}
        options={dynamicParameters}
        onChange={(newValue) => {
          setDynamicValue(newValue);
        }}
      />
      {dynamicValue && dynamicValue == "DeviceDetail" && (
        <div
          style={{ display: "flex", flexDirection: "column", rowGap: "8px" }}
        >
          <Typography>{t("DesignerTranslations.t.deviceDetail")}</Typography>
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ display: "flex", columnGap: "16px" }}>
              <CustomTextField
                placeholder="e.g., 1"
                value={numberValue}
                type="number"
                onChange={handleNumberChange}
                disabled={stringValue !== ""}
              />
              <CustomTextField
                placeholder="e.g., RAM"
                value={stringValue}
                onChange={handleStringChange}
                disabled={numberValue !== ""}
              />
            </div>
          </div>
        </div>
      )}
      {dynamicValue && dynamicValue == "DeviceDetail" && showRadioGroup && (
        <RadioGroup value={selectedRadioOption} onChange={handleRadioChange}>
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
      {addDynamicText && (
        <CustomIconButton
          style={{ padding: "4px" }}
          onClick={handleAddButton}
          disabled={handleDisableAdd()}
          size="large"
        >
          <AddIcon />
        </CustomIconButton>
      )}
    </div>
  );
};

export default DynamicText;
