import { FormControlLabel, Typography } from "@mui/material";
import CheckBoxLabel from "../../../../components/CheckBoxes/CheckBoxLabel";
import CustomStyledCheckBox from "../../../../components/CheckBoxes/CustomStyledCheckBox";
import SelectFromObject from "../../../../components/Select/SelectFromObject";
import CustomTextField from "../../../../components/TextFields/CustomTextField";
import React, { useEffect, useState } from "react";
import { useTranslation } from "../../translationUtils";

const OnIdleEditor = ({ screenIndex, selectedDesign, setSelectedDesign }) => {
  const { t } = useTranslation();
  const [enableOnIdle, setEnableOnIdle] = useState(false);
  const time =
    selectedDesign.Configuration.screens[screenIndex].onIdleReturn.time;
  const screenToReturn =
    selectedDesign.Configuration.screens[screenIndex].onIdleReturn.id;

  let availableScreens = selectedDesign.Configuration.screens.map(
    (screen, index) => {
      return {
        value: screen.id,
        label: screen.name,
        disabled: index == screenIndex,
      };
    }
  );
  const handleReturnScreen = (key: "id" | "time", value) => {
    let screens = selectedDesign.Configuration.screens.map((screen, index) => {
      if (index === screenIndex) {
        return {
          ...screen,
          onIdleReturn: {
            ...screen.onIdleReturn,
            [key]: value,
          },
        };
      }
      return screen;
    });
    setSelectedDesign((prevDesign) => ({
      ...prevDesign,
      Configuration: { screens: screens },
    }));
  };

  const handleCheck = (value: boolean) => {
    setEnableOnIdle(value);
    if (!value) {
      let screens = selectedDesign.Configuration.screens.map((screen, index) => {
        if (index === screenIndex) {
          return {
            ...screen,
            onIdleReturn: { id: "", time: "" },
          };
        }
        return screen;
      });
      setSelectedDesign((prevDesign) => ({
        ...prevDesign,
        Configuration: { screens: screens },
      }));
    }
  };

  useEffect(() => {
    setEnableOnIdle(
      !!(
        selectedDesign.Configuration.screens[screenIndex].onIdleReturn.id ||
        selectedDesign.Configuration.screens[screenIndex].onIdleReturn.time
      )
    );
  }, [screenIndex]);

  return (
    <>
      <CheckBoxLabel
        control={
          <CustomStyledCheckBox
            checked={enableOnIdle}
            onClick={(e) => handleCheck((e.target as HTMLInputElement).checked)}
          />
        }
        disabled={selectedDesign.Configuration.screens[screenIndex].length == 1}
        label={t("DesignerTranslations.t.enableIdle")}
      />
      {enableOnIdle && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Typography>{t("DesignerTranslations.t.goToScreen")}</Typography>
            <SelectFromObject
              style={{ width: "100%", marginTop: 0 }}
              value={screenToReturn}
              onChange={(value) => handleReturnScreen("id", value)}
              options={availableScreens}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Typography>{t("DesignerTranslations.t.after")}</Typography>
            <FormControlLabel
              control={
                <CustomTextField
                  variant="outlined"
                  type="number"
                  value={time}
                  onChange={(e) => handleReturnScreen("time", e.target.value)}
                />
              }
              labelPlacement="end"
              label="seconds"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default OnIdleEditor;
