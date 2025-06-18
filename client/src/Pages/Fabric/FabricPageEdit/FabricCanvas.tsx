import React from "react";
import useGuidelinesHandlers from "./FabricHandlers/Guidelines.handlers";
import useContextMenuHandlers from "./FabricHandlers/ContextMenu.handlers";
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import useEventHandlers from "./FabricHandlers/Event.handlers";
import styled from "styled-components";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useTranslation } from "../translationUtils";

const CustomMenu = styled(Menu)({
  ".MuiMenu-list": {
    display: "flex",
  },
});

const ItemMenu = ({
  itemMenuMouseX,
  itemMenuMouseY,
  handleCloseItemMenu,
  itemMenuClick,
  itemMenuData,
  openSecondList,
  handleMouseEnter,
  addObjects,
  canvas,
  handleStartDrawing,
  t,
}) => {
  return itemMenuData ? (
    <Menu
      id="itemMenu"
      onClose={handleCloseItemMenu}
      open={!!itemMenuMouseX && !!itemMenuMouseY}
      anchorReference="anchorPosition"
      anchorPosition={
        itemMenuMouseY !== null && itemMenuMouseX !== null
          ? {
              top: itemMenuMouseY,
              left: itemMenuMouseX,
            }
          : undefined
      }
    >
      <MenuItem onClick={() => itemMenuClick("delete")}>
        {t("GeneralTranslations.t.delete")}
      </MenuItem>
      <MenuItem onClick={() => itemMenuClick("sendToBack")}>
        {t("DesignerTranslations.t.sendToBack")}
      </MenuItem>
      <MenuItem onClick={() => itemMenuClick("sendBackwards")}>
        {t("DesignerTranslations.t.sendBackwards")}
      </MenuItem>
      <MenuItem onClick={() => itemMenuClick("bringToFront")}>
        {t("DesignerTranslations.t.bringToFront")}
      </MenuItem>
      <MenuItem onClick={() => itemMenuClick("bringForwards")}>
        {t("DesignerTranslations.t.bringForwards")}
      </MenuItem>
      <MenuItem onClick={() => itemMenuClick("duplicate")}>
        {t("DesignerTranslations.t.duplicate")}
      </MenuItem>
    </Menu>
  ) : (
    <CustomMenu
      id="itemMenu"
      elevation={0}
      onClose={handleCloseItemMenu}
      open={!!itemMenuMouseX && !!itemMenuMouseY}
      anchorReference="anchorPosition"
      anchorPosition={
        itemMenuMouseY !== null && itemMenuMouseX !== null
          ? {
              top: itemMenuMouseY,
              left: itemMenuMouseX,
            }
          : undefined
      }
    >
      <MenuItem
        onClick={handleMouseEnter}
        style={{ height: "fit-content", minWidth: "90px" }}
      >
        <ListItemText primary={t("GeneralTranslations.t.add")} />
        <ListItemIcon style={{ minWidth: "unset" }}>
          <KeyboardArrowRightIcon />
        </ListItemIcon>
      </MenuItem>
      {openSecondList && (
        <div>
          <MenuItem onClick={() => addObjects(0, "IText", canvas)}>
            {t("DesignerTranslations.t.text")}
          </MenuItem>
          <MenuItem onClick={() => addObjects(0, "Rect", canvas)}>
            {t("DesignerTranslations.t.rectangle")}
          </MenuItem>
          <MenuItem onClick={() => addObjects(0, "Ellipse", canvas)}>
            {t("DesignerTranslations.t.circle")}
          </MenuItem>
          <MenuItem onClick={() => addObjects(0, "Triangle", canvas)}>
            {t("DesignerTranslations.t.triangle")}
          </MenuItem>
          <MenuItem
            onClick={() => {
              addObjects(1, "Line", handleStartDrawing);
            }}
          >
            {t("DesignerTranslations.t.line")}
          </MenuItem>
          <MenuItem
            onClick={() => {
              addObjects(2, "Button", canvas);
            }}
          >
            {t("DesignerTranslations.t.button")}
          </MenuItem>
          <MenuItem
            onClick={() => {
              addObjects(2, "Weather", canvas);
            }}
          >
            {t("DesignerTranslations.t.weather")}
          </MenuItem>
          <MenuItem
            onClick={() => {
              addObjects(2, "RSSFeed", canvas);
            }}
          >
            {t("DesignerTranslations.t.rssFeed")}
          </MenuItem>
          <MenuItem
            onClick={() => {
              addObjects(2, "QRCode", canvas);
            }}
          >
            {t("DesignerTranslations.t.qrCode")}
          </MenuItem>
        </div>
      )}
      {/* Add more MenuItems as needed */}
    </CustomMenu>
  );
};

const FabricCanvas = ({
  canvas,
  landingAreaRectRef,
  canvasRef,
  selectedObject,
  setSelectedObject,
  selectedDesign,
  handleStartDrawing,
  cursorState,
  screenIndex,
  zoomTextRef,
}) => {
  const { t } = useTranslation();
  const { movingGuidelines } = useGuidelinesHandlers({
    canvas: canvas,
    screenResolution: {
      width: selectedDesign.Configuration.screens[screenIndex].resolution.width,
      height:
        selectedDesign.Configuration.screens[screenIndex].resolution.height,
    },
  });
  const {
    itemMenuMouseX,
    itemMenuMouseY,
    itemMenuData,
    onContextMenu,
    itemMenuClick,
    handleCloseItemMenu,
    openSecondList,
    handleMouseEnter,
    addObjects,
  } = useContextMenuHandlers({
    selectedObject: selectedObject,
    setSelectedObject: setSelectedObject,
    canvas: canvas,
    selectedDesign: selectedDesign,
    screenIndex: screenIndex,
  });

  const onBrowserCtxMenu = (event) => {
    event.preventDefault();
  };

  const { drop } = useEventHandlers({
    canvas: canvas,
    landingAreaRectRef: landingAreaRectRef,
    onContextMenu: onContextMenu,
    movingGuidelines: movingGuidelines,
    setSelectedObject: setSelectedObject,
    selectedObject: selectedObject,
    selectedDesign: selectedDesign,
    cursorState: cursorState,
    screenIndex: screenIndex,
    zoomText: zoomTextRef,
  });

  const containerStyle = {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "auto",
    marginBlock: "6px",
  };
  return (
    <div
      id="containerCanvasAll"
      style={containerStyle}
      onContextMenu={(e) => onBrowserCtxMenu(e)}
    >
      <div
        ref={drop}
        data-tut="Canvas"
        style={{
          overflow: "auto",
          height: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "100%", height: "100%" }}>
          <canvas
            style={{ width: "100%", height: "100%" }}
            id="canvas"
            ref={canvasRef}
          />
        </div>
      </div>
      <ItemMenu
        itemMenuMouseX={itemMenuMouseX}
        itemMenuMouseY={itemMenuMouseY}
        handleCloseItemMenu={handleCloseItemMenu}
        itemMenuClick={itemMenuClick}
        itemMenuData={itemMenuData}
        openSecondList={openSecondList}
        handleMouseEnter={handleMouseEnter}
        addObjects={addObjects}
        canvas={canvas}
        handleStartDrawing={handleStartDrawing}
        t={t}
      />
    </div>
  );
};

export default FabricCanvas;
