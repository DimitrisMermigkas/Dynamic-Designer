import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import ChangeHistoryIcon from "@mui/icons-material/ChangeHistory";
import CropSquareIcon from "@mui/icons-material/CropSquare";
import DeleteIcon from "@mui/icons-material/Delete";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import FilterFramesIcon from "@mui/icons-material/FilterFrames";
import MovieIcon from "@mui/icons-material/Movie";
import PersonalVideoIcon from "@mui/icons-material/PersonalVideo";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import { Button, Grid2, List, ListItem, Typography } from "@mui/material";
import CustomIconButton from "../../../../components/CustomButtons/IconButton";
import React, { useEffect, useState } from "react";
import VerticalTriggerStepper from "./VerticalTriggerStepper";
import { useTranslation } from "../../translationUtils";

const ListRow = ({
  index,
  event,
  selectedDesign,
  screenIndex,
  deleteTrigger,
}) => {
  const isScreen =
    selectedDesign.Configuration.screens.find(
      (screen) => screen.id == event.referenceId
    ) || false;
  const isObject =
    selectedDesign.Configuration.screens[screenIndex].objects.find(
      (object) => object.id == event.referenceId
    ) || false;

  const getIconType = (obj) => {
    if (obj.type === "IText") {
      return <TextFieldsIcon />;
    } else if (obj.type === "Multimedia") {
      return <MovieIcon />;
    } else if (obj.type === "Triangle") {
      return <ChangeHistoryIcon />;
    } else if (obj.type === "Rect") {
      return <CropSquareIcon />;
    } else if (obj.type === "Ellipse") {
      return <FiberManualRecordIcon />;
    } else if (obj.type === "Polygon") {
      return <FilterFramesIcon />;
    } else if (obj.type === "Line") {
      return <ShowChartIcon />;
    }
  };

  const iconType = isScreen ? <PersonalVideoIcon /> : getIconType(isObject);
  let referenceName;
  if (isScreen) {
    referenceName = isScreen.name;
  } else if (isObject) {
    referenceName = isObject.name;
  } else {
    referenceName = event.action;
  }
  return (
    <div
      style={{
        width: "100%",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "4px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
      }}
    >
      <Typography>{event.type}</Typography>
      <div style={{ display: "flex", alignItems: "center", columnGap: "8px" }}>
        {iconType}
        <Typography>{referenceName}</Typography>
      </div>
      <CustomIconButton onClick={() => deleteTrigger(index)} size="large">
        <DeleteIcon />
      </CustomIconButton>
    </div>
  );
};
const TriggerEventEditor = ({
  canvas,
  screenIndex,
  selectedDesign,
  selectedObject,
  setSelectedObject,
}) => {
  const { t } = useTranslation();
  const [actionList, setActionList] = useState([]);
  const [openStepper, setOpenStepper] = useState(false);

  useEffect(() => {
    setActionList(selectedObject?.triggers || []);
  }, [selectedObject]);

  const onApply = (trigger) => {
    const activeObj = canvas.getActiveObject();
    if (activeObj?.id == selectedObject.id) {
      setActionList((list) => {
        let tempList = [...list];
        tempList.push(trigger);
        activeObj.set("triggers", tempList);
        return tempList;
      });
      canvas.renderAll();
      setSelectedObject(activeObj);
    }
    setOpenStepper(false);
  };

  const deleteTrigger = (index) => {
    setActionList((prevData) => prevData.filter((item, i) => i !== index));
  };

  // find other button that has trigger event active :
  const canvasObjects = canvas.getObjects();
  const allActiveTriggers = canvasObjects
    .filter(
      (object) =>
        object.type === "Button" &&
        object.triggers &&
        object.triggers.length > 0
    )
    .flatMap((object) =>
      object.triggers.map((trigger) => ({
        id: object.id,
        name: object.name,
        referenceId: trigger.referenceId,
      }))
    );

  const filterScreens = (selectedDesign) => {
    const filteredScreens = selectedDesign.Configuration.screens.map(
      (screen, index) => {
        let takenScreenByButton;
        if (allActiveTriggers.length > 0)
          takenScreenByButton = allActiveTriggers.filter(
            (trigger) => trigger.referenceId == screen.id
          );

        let labelUpdated;
        if (takenScreenByButton?.length > 0) {
          if (takenScreenByButton.length > 1)
            labelUpdated = `${screen.name}-Pos ${index} (${takenScreenByButton.length})`;
          else
            labelUpdated = `${screen.name}-Pos ${index} (${takenScreenByButton[0].name})`;
        } else labelUpdated = `${screen.name}-Pos ${index}`;
        return {
          value: screen.id,
          label: labelUpdated,
          disabled: screenIndex == index,
        };
      }
    );
    return filteredScreens;
  };
  const [screenOptions, setScreenOptions] = useState(
    filterScreens(selectedDesign)
  );

  useEffect(() => {
    setScreenOptions(filterScreens(selectedDesign));
  }, [selectedDesign]);
  const totalSteps = [
    {
      label: t("DesignerTranslations.t.eventType"),
      options: [
        {
          value: "onClick",
          label: t("DesignerTranslations.t.onClick"),
        },
      ],
      initialStep: true,
      addStep: { index: -1, value: "" },
    },
    {
      label: t("DesignerTranslations.t.action"),
      options: [
        {
          value: "goToScreen",
          label: t("DesignerTranslations.t.goToScreen"),
        },
        {
          value: "tryMe",
          label: t("DesignerTranslations.t.tryMe"),
        },
      ],
      initialStep: true,
      addStep: { index: 2, value: "goToScreen" },
    },
    {
      label: t("DesignerTranslations.t.reference"),
      options: screenOptions,
      initialStep: false,
      addStep: { index: -1, value: "" },
    },
  ];
  return (
    <Grid2
      container
      spacing={2}
      style={{
        display: "flex",
        width: "100%",
        columnGap: "8px",
        justifyContent: "space-around",
      }}
      size={12}
    >
      {!openStepper && (
        <Grid2 container size={12}>
          <Grid2 size={12}>
            <Typography>{t("DesignerTranslations.t.triggerList")}</Typography>
          </Grid2>
          <Grid2 size={12}>
            <List
              style={{
                rowGap: "8px",
                display: "flex",
                flexDirection: "column",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "4px",
              }}
            >
              {actionList.map((ac, index) => {
                return (
                  <ListRow
                    event={ac}
                    index={index}
                    deleteTrigger={deleteTrigger}
                    selectedDesign={selectedDesign}
                    screenIndex={screenIndex}
                  />
                );
              })}
              <ListItem
                style={{
                  width: "100%",
                  display: "flex",
                  backgroundColor: "#ffffff08",
                  height: "42px",
                }}
              >
                <CustomIconButton
                  onClick={() => setOpenStepper(true)}
                  style={{ width: "100%", borderRadius: "4px" }}
                  size="large"
                >
                  <AddBoxOutlinedIcon />
                </CustomIconButton>
              </ListItem>
            </List>
          </Grid2>
        </Grid2>
      )}
      {openStepper && (
        <>
          <Button onClick={() => setOpenStepper(false)}>
            {t("DesignerTranslations.t.return")}
          </Button>
          <VerticalTriggerStepper
            totalSteps={totalSteps}
            stateKeys={["type", "action", "referenceId"]}
            onApply={onApply}
          />
        </>
      )}
    </Grid2>
  );
};

export default TriggerEventEditor;
