import React, { useEffect } from "react";
import { Button, Typography, Paper } from "@mui/material";
import CustomItemsPicker from "../FabricItemsSchema/CustomItemsPicker";
import Draggable from "react-draggable";

const PreviewElementDialog = ({
  selectedObject,
  open,
  onClose,
  settings,
  canvas,
  selectedDesign,
  screenIndex,
}) => {
  const customElement = CustomItemsPicker({
    canvasDimension: {
      width: canvas.width / canvas.viewportZoom,
      height: canvas.height / canvas.viewportZoom,
    },
    screenDimension:
      selectedDesign.Configuration.screens[screenIndex].resolution,
    type: selectedObject.type,
    preview: true,
    ...settings,
  });

  let paperStyle: React.CSSProperties = {
    position: "fixed",
    transform: "translate(0%, 0%)",
    zIndex: 9999,
    maxWidth: selectedObject.type == "RSSFeed" ? "1150px" : "unset",
    maxHeight: selectedObject.type == "RSSFeed" ? "400px" : "unset",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  useEffect(() => {
    if (open) {
      const draggablePaperElement = document.querySelector("#draggablePaper");

      const draggablePaperBoundRect = document
        .querySelector("#draggablePaper")
        ?.getBoundingClientRect();
      const parentRect = document
        .querySelector("#containerCanvasAll")
        .getBoundingClientRect();
      const divWidth =
        draggablePaperBoundRect.width > 1150
          ? 1150
          : draggablePaperBoundRect.width;
      const parentWidth = parentRect.width;
      const divHeight =
        draggablePaperBoundRect.height > 400
          ? 400
          : draggablePaperBoundRect.height;
      const parentHeight = parentRect.height;

      const parentCenterX = parentWidth / 2 + parentRect.x;
      const parentCenterY = parentHeight / 2 + parentRect.y;
      // Calculate the left position to center the div's X center with the parent's X center
      const leftPosition = parentCenterX - divWidth;
      const topPosition = parentCenterY - divHeight;

      // Update the style to center the div
      (draggablePaperElement as HTMLElement).style.left = `${leftPosition}px`;
      (draggablePaperElement as HTMLElement).style.top = `${topPosition}px`;
    }
  }, [open]);

  const handleClose = () => {
    onClose();
  };

  return open ? (
    <Draggable handle="h6">
      <Paper style={paperStyle} id="draggablePaper">
        <Typography
          variant="h6"
          style={{
            padding: "16px",
            width: "calc(100% - 32px)",
            display: "flex",
            justifyContent: "center",
            cursor: "move",
          }}
        >
          {`${selectedObject.type} Preview`}
        </Typography>
        <div
          style={{
            position: "relative",
            height:
              selectedObject.type == "RSSFeed"
                ? "100%"
                : customElement.props.config.height,
            width:
              selectedObject.type == "RSSFeed"
                ? "100%"
                : customElement.props.config.width,
          }}
        >
          {customElement}
        </div>
        <Button
          onClick={handleClose}
          color="primary"
          style={{ margin: "16px" }}
        >
          Close
        </Button>
      </Paper>
    </Draggable>
  ) : (
    <></>
  );
};

export default PreviewElementDialog;
