import { Delete } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import ChangeHistoryIcon from "@mui/icons-material/ChangeHistory";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import CropSquareIcon from "@mui/icons-material/CropSquare";
import DeleteIcon from "@mui/icons-material/Delete";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import FilterFramesIcon from "@mui/icons-material/FilterFrames";
import MovieIcon from "@mui/icons-material/Movie";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import {
  Button,
  Divider,
  List,
  ListItemButton,
  Typography,
  useTheme,
} from "@mui/material";
import CustomIconButton from "../../../../components/CustomButtons/IconButton";
import ConfirmDialog from "../../../../components/CustomDialogs/ConfirmDialog";
import React, { useEffect, useState } from "react";
import { makeStyles } from "tss-react/mui";
import { v4 as uuid } from "uuid";
import ButtonSvg from "./images/ButtonSvg";
import FlagSvg from "./images/FlagSvg";
import PagesSvg from "./images/PagesSvg";
import QrCodeSvg from "./images/QrCodeSvg";
import RssFeedSvg from "./images/RssFeedSvg";
import WeatherSvg from "./images/WeatherSvg";
import { useTranslation } from "../../translationUtils";

const useStyles = makeStyles()((theme) => ({
  buttonRoot: {
    display: "flex",
    alignItems: "center",
    borderRadius: "8px",
    width: "80%",
    padding: theme.spacing(1),
    justifyContent: "space-between",
  },
}));

const ListRow = ({
  obj,
  index,
  handleSelectObject,
  selectedListObject,
  handleDelete,
  theme,
}) => {
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
    } else if (obj.type === "RSSFeed") {
      return <RssFeedSvg fill={undefined} />;
    } else if (obj.type === "Weather") {
      return <WeatherSvg fill={undefined} />;
    } else if (obj.type === "Button") {
      return <ButtonSvg fill={undefined} />;
    } else if (obj.type === "QRCode") {
      return <QrCodeSvg fill={undefined} />;
    }
  };

  const iconType = getIconType(obj);

  return (
    <ListItemButton
      selected={selectedListObject === obj}
      key={obj.id}
      component="div"
      // flex="1"
      style={{
        cursor: selectedListObject === obj ? "grab" : "pointer",
        justifyContent: "space-between",
        padding: 0,
        background: selectedListObject === obj ? "#4A5878" : "#232429",
      }}
      onClick={() => handleSelectObject(obj)}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div
        style={{
          display: "flex",
          columnGap: theme.spacing(1),
          paddingInlineStart: theme.spacing(1.5),
        }}
      >
        {iconType}
        <Typography>{obj.name}</Typography>
      </div>
      <CustomIconButton
        aria-label="delete"
        onClick={() => handleDelete(obj)}
        size="large"
      >
        <DeleteIcon />
      </CustomIconButton>
    </ListItemButton>
  );
};

type ScreensLayersProps = {
  selectedDesign;
  setSelectedDesign;
  handleSecondDrawerClose;
  screenIndex: number;
  changeDesignScreen: (screenIndex: number) => void;
  addNewScreenToDesign;
  handleDelete;
  handleSelectObject;
  selectedListObject;
  canvas;
};

const ScreensLayers = ({
  selectedDesign,
  setSelectedDesign,
  handleSecondDrawerClose,
  screenIndex,
  changeDesignScreen,
  addNewScreenToDesign,
  handleDelete,
  handleSelectObject,
  selectedListObject,
  canvas,
}: ScreensLayersProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { classes } = useStyles();
  const [reverseArray, setReverseArray] = useState([]);
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  useEffect(() => {
    const updateReverseArray = () => {
      const tempArray = [...canvas.getObjects()];
      setReverseArray(tempArray.reverse());
    };

    if (!canvas) return;
    else {
      updateReverseArray();
    }

    // Ensure objects are updated when canvas renders or objects change
    const handleCanvasUpdate = () => {
      setIsCanvasReady(true);
      updateReverseArray();
    };

    // Attach relevant Fabric.js events
    canvas.on("object:added", handleCanvasUpdate);
    canvas.on("object:removed", handleCanvasUpdate);
    canvas.on("objectPos:changed", updateReverseArray);
    canvas.on("otherObject:selected", (e) => {
      const object = e.target;
      handleSelectObject(object);
    });

    // Cleanup on unmount
    return () => {
      canvas.off("object:added", handleCanvasUpdate);
      canvas.off("object:removed", handleCanvasUpdate);
      canvas.off("objectPos:changed", updateReverseArray);
      canvas.off("otherObject:selected");
    };
  }, [canvas, handleSelectObject]);

  useEffect(() => {
    if (isCanvasReady) {
      // Safely update the reverse array when screenIndex changes
      const tempArray = [...canvas.getObjects()];
      setReverseArray(tempArray.reverse());
    }
  }, [canvas, screenIndex, isCanvasReady]);

  const screens = selectedDesign.Configuration.screens;

  const [switchToObjects, setSwitchToObjects] = useState(false);
  const [openConfirmationModal, setOpenConfirmationModal] = useState(null);

  const handleClick = (index: number) => {
    setSwitchToObjects(true);
    if (index !== screenIndex) changeDesignScreen(index);
  };
  const handleClickArrow = () => {
    if (!switchToObjects) {
      handleSecondDrawerClose();
    } else {
      setSwitchToObjects(false);
    }
  };

  const deleteDesignScreen = (index) => {
    let updatedScreens = selectedDesign.Configuration.screens.filter(
      (screen, idx) => idx !== index
    );
    if (updatedScreens.length == 0) {
      updatedScreens = [
        {
          name: "Screen-1",
          id: uuid(),
          default: true,
          onIdleReturn: {
            id: "",
            time: "",
          },
          background: "#FFFFFF",
          orientation: selectedDesign.Configuration.screens[index].orientation,
          resolution: selectedDesign.Configuration.screens[index].resolution,
          objects: [],
          previewImageUrl:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=",
        },
      ];
      // Get all objects on the canvas
      const allObjects = canvas.getObjects();

      // Iterate through all objects and remove each one
      allObjects.forEach((obj) => canvas.remove(obj));
      canvas.set("background", updatedScreens[0].background);
      canvas.renderAll();
    }
    const updatedDesign = {
      ...selectedDesign,
      Configuration: {
        ...selectedDesign.Configuration,
        screens: updatedScreens,
      },
    };
    setOpenConfirmationModal(null);
    setSelectedDesign(updatedDesign);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <CustomIconButton
            style={{ fill: theme.palette.text.secondary }}
            onClick={handleClickArrow}
            size="large"
          >
            <ChevronLeftIcon />
          </CustomIconButton>
          <Typography
            variant="h6"
            style={{ color: theme.palette.text.secondary }}
          >
            {switchToObjects
              ? screens[screenIndex].name
              : t("DesignerTranslations.t.screens")}
          </Typography>
        </div>
        <div style={{ display: "flex" }}>
          {!switchToObjects && (
            <CustomIconButton onClick={addNewScreenToDesign} size="large">
              <AddIcon />
            </CustomIconButton>
          )}
        </div>
      </div>
      <Divider style={{ margin: "8px" }} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          rowGap: theme.spacing(0.5),
        }}
      >
        {!switchToObjects ? (
          screens.map((screen, index) => (
            <Button
              key={index}
              classes={{ root: classes.buttonRoot }}
              style={{
                background: index == screenIndex ? "#4A5878" : "#232429",
              }}
              onClick={() => handleClick(index)}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  columnGap: "8px",
                }}
              >
                {screen.default ? (
                  <FlagSvg fill={"white"} />
                ) : (
                  <PagesSvg fill={theme.palette.text.secondary} />
                )}
                <Typography variant="body1">{screen.name}</Typography>
              </div>
              <CustomIconButton
                style={{ padding: "3px" }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpenConfirmationModal(index);
                }}
                size="large"
              >
                <Delete />
              </CustomIconButton>
            </Button>
          ))
        ) : (
          <List style={{ padding: 0, width: "100%" }}>
            {reverseArray.map((object, index) => {
              return (
                <ListRow
                  key={object.id}
                  obj={object}
                  index={index}
                  handleSelectObject={handleSelectObject}
                  selectedListObject={selectedListObject}
                  handleDelete={handleDelete}
                  theme={theme}
                />
              );
            })}
          </List>
        )}
      </div>
      {openConfirmationModal !== null && (
        <ConfirmDialog
          open={openConfirmationModal !== null}
          content={`Are you sure you want to delete  ${selectedDesign.Configuration.screens[openConfirmationModal]?.name}?`}
          okFunc={() => deleteDesignScreen(openConfirmationModal)}
          cancelFunc={() => setOpenConfirmationModal(null)}
        />
      )}
    </div>
  );
};

export default ScreensLayers;
