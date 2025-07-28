import React, { useState } from "react";
import { Drawer, IconButton, Tooltip, useTheme } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import FabricSecondDrawer from "./FabricComponents/FabricSecondDrawer";
import useToolbarHandlers, {
  createSplitAreas,
} from "./FabricHandlers/Toolbar.handlers";
import CustomDrawerPopover from "./FabricComponents/CustomDrawerPopover";
import ScreensLayers from "./FabricComponents/ScreensLayers";
import ShapesSvg from "./FabricComponents/images/ShapesSvg";
import LayoutsSvg from "./FabricComponents/images/LayoutsSvg";
import WidgetsSvg from "./FabricComponents/images/WidgetsSvg";
import LayersSvg from "./FabricComponents/images/LayersSvg";
import LibrarySvg from "./FabricComponents/images/LibrarySvg";
import PointerSvg from "./FabricComponents/images/PointerSvg";
import TriangleSvg from "./FabricComponents/images/TriangleSvg";
import CircleSvg from "./FabricComponents/images/CircleSvg";
import TextSvg from "./FabricComponents/images/TextSvg";
import ButtonSvg from "./FabricComponents/images/ButtonSvg";
import WeatherSvg from "./FabricComponents/images/WeatherSvg";
import RssFeedSvg from "./FabricComponents/images/RssFeedSvg";
import QrCodeSvg from "./FabricComponents/images/QrCodeSvg";
import EmbedSvg from "./FabricComponents/images/EmbedSvg";
import FullscreenSvg from "./FabricComponents/images/FullscreenSvg";
import VerticalSplitSvg from "./FabricComponents/images/VefrticalSplitSvg";
import HorizontalSplitSvg from "./FabricComponents/images/HorizontalSplitSvg";
import FourWaySplitSvg from "./FabricComponents/images/4WaySplitSvg";
import LineSvg from "./FabricComponents/images/LineSvg";
import CursorGrabSvg from "./FabricComponents/images/CursorGrabSvg";
import { useTranslation } from "../translationUtils";
import CustomTextField from "../../../components/TextFields/CustomTextField";
import CustomIconButton from "../../../components/CustomButtons/IconButton";

const useStyles = makeStyles()({
  root: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  button: {
    padding: "5px",
  },
  paperAnchorLeft: { height: "calc(100% - 46px)", top: "46px" },
});

const FabricDrawer = ({
  canvas,
  setSelectedObject,
  handleStartDrawing,
  selectedDesign,
  setSelectedDesign,
  screenIndex,
  changeDesignScreen,
  addNewScreenToDesign,
  cursorState,
  setCursorState,
  zoomTextRef,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const currentTheme = theme.palette.mode === "dark" ? "dark" : "light";

  const [secondDrawerOpen, setSecondDrawerOpen] = useState({
    open: false,
    drawerComp: null,
  });

  const handleSecondDrawerOpen = (comp) => () => {
    setSecondDrawerOpen({ open: true, drawerComp: comp });
  };

  const handleSecondDrawerClose = () => {
    setSecondDrawerOpen({ open: false, drawerComp: null });
  };

  const switchDrawerPopover = (value) => (e) => {
    if (value == "Library" || value == "Layers") {
      if (
        secondDrawerOpen &&
        secondDrawerOpen.open &&
        secondDrawerOpen.drawerComp == value
      )
        handleSecondDrawerClose();
      else {
        handleSecondDrawerOpen(value)();
        handleClosePopover();
      }
    } else {
      if (openCustomPopover && openCustomPopover.open) handleClosePopover();
      else {
        handleSecondDrawerClose();
        handleOpenPopover(value)(e);
      }
    }
  };
  const {
    handleClosePopover,
    handleOpenPopover,
    selectedListObject,
    handleDelete,
    handleSelectObject,
    handleClickDrawerSubItem,
    openCustomPopover,
  } = useToolbarHandlers({
    canvas,
    selectedDesign,
    screenIndex,
    handleStartDrawing,
    setSelectedObject,
    setCursorState,
  });
  const popoverListItems = {
    Pointer: [{ icon: PointerSvg }, { icon: CursorGrabSvg }],
    Elements: [
      {
        icon: TriangleSvg,
        name: t("DesignerTranslations.t.triangle"),
      },
      {
        icon: ShapesSvg,
        name: t("DesignerTranslations.t.rectangle"),
      },
      { icon: CircleSvg, name: t("DesignerTranslations.t.circle") },
      {
        icon: TextSvg,
        name: t("DesignerTranslations.t.text"),
      },
      { icon: LineSvg, name: t("DesignerTranslations.t.line") },
    ],
    Widgets: [
      {
        icon: ButtonSvg,
        name: t("DesignerTranslations.t.button"),
      },
      {
        icon: WeatherSvg,
        name: t("DesignerTranslations.t.weather"),
      },
      {
        icon: RssFeedSvg,
        name: t("DesignerTranslations.t.rssFeed"),
      },
      {
        icon: QrCodeSvg,
        name: t("DesignerTranslations.t.qrCode"),
      },
      {
        icon: EmbedSvg,
        name: "Embed",
      },
    ],
    Layouts: [
      {
        icon: FullscreenSvg,
        name: t("DesignerTranslations.t.fullscreenView"),
      },
      {
        icon: VerticalSplitSvg,
        name: t("DesignerTranslations.t.verticalSplit"),
      },
      {
        icon: HorizontalSplitSvg,
        name: t("DesignerTranslations.t.horizontalSplit"),
      },
      {
        icon: FourWaySplitSvg,
        name: t("DesignerTranslations.t.fourWayView"),
      },
    ],
  };
  const svgIcons = [
    {
      name: t("DesignerTranslations.t.zoom"),
      icon: null,
      component: (
        <CustomTextField
          inputRef={zoomTextRef}
          type="text"
          disabled
          style={{ maxWidth: "64.5px" }}
          value={Math.round(canvas?.scrollingZoom * 100) + "%" || "100%"}
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
        />
      ),
    },
    cursorState == "pointer"
      ? {
          name: t("DesignerTranslations.t.pointer"),
          icon: PointerSvg,
          onClick: switchDrawerPopover("Pointer"),
        }
      : {
          name: t("DesignerTranslations.t.pointer"),
          icon: CursorGrabSvg,
          onClick: switchDrawerPopover("Pointer"),
        },
    {
      name: t("DesignerTranslations.t.elements"),
      icon: ShapesSvg,
      onClick: switchDrawerPopover("Elements"),
    },
    {
      name: t("DesignerTranslations.t.widgets"),
      icon: WidgetsSvg,
      onClick: switchDrawerPopover("Widgets"),
    },
  ];
  const svgIcons2 = [
    {
      name: t("DesignerTranslations.t.layouts"),
      icon: LayoutsSvg,
      onClick: switchDrawerPopover("Layouts"),
    },
    {
      name: t("DesignerTranslations.t.layers"),
      icon: LayersSvg,
      onClick: switchDrawerPopover("Layers"),
    },
    {
      name: t("DesignerTranslations.t.library"),
      icon: LibrarySvg,
      onClick: switchDrawerPopover("Library"),
    },
  ];
  const { classes } = useStyles();

  const executeFunctions = ({ ...props }) => {
    if (openCustomPopover?.popoverName !== "Layouts") {
      handleClickDrawerSubItem(props.id, props.itemNo);
    } else {
      createSplitAreas(props.index, canvas);
    }
  };

  return (
    <>
      <Drawer
        classes={{ paperAnchorLeft: classes.paperAnchorLeft }}
        variant="permanent"
        anchor="left"
        id="DrawerV2"
        style={{ height: "100%", width: "64.5px", zIndex: 2999 }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {svgIcons.map((icon, index) => {
            return icon.icon ? (
              <CustomIconButton
                key={icon.name}
                style={{ display: "flex", borderRadius: 0 }}
                onClick={(e) => {
                  if (icon?.onClick) icon.onClick(e);
                }}
                size="large"
              >
                {React.createElement(icon.icon, {
                  fill: currentTheme === "light" ? "black" : "white",
                  strokeWidth: 0,
                })}
                <KeyboardArrowDownIcon />
              </CustomIconButton>
            ) : (
              icon.component
            );
          })}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            height: "100%",
          }}
        >
          {svgIcons2.map((icon) => {
            const iconComponent = (
              <CustomIconButton
                key={icon.name}
                style={{ display: "flex", borderRadius: 0 }}
                onClick={icon.onClick}
                size="large"
                disabled={icon.name == "Library"}
                sx={{
                  "&:disabled": {
                    opacity: 0.5,
                    cursor: "not-allowed",
                  },
                }}
              >
                {React.createElement(icon.icon, {
                  fill:
                    secondDrawerOpen.drawerComp == icon.name
                      ? theme.palette.primary.main
                      : currentTheme === "light"
                      ? "black"
                      : "white",
                })}
              </CustomIconButton>
            );

            return iconComponent;
          })}
        </div>
      </Drawer>
      {secondDrawerOpen.open && (
        <FabricSecondDrawer open={secondDrawerOpen?.open}>
          {secondDrawerOpen.drawerComp == "Layers" && (
            <ScreensLayers
              selectedDesign={selectedDesign}
              setSelectedDesign={setSelectedDesign}
              screenIndex={screenIndex}
              handleSecondDrawerClose={handleSecondDrawerClose}
              changeDesignScreen={changeDesignScreen}
              addNewScreenToDesign={addNewScreenToDesign}
              handleSelectObject={handleSelectObject}
              selectedListObject={selectedListObject}
              handleDelete={handleDelete}
              canvas={canvas}
            />
          )}
        </FabricSecondDrawer>
      )}
      {openCustomPopover.open && (
        <CustomDrawerPopover
          openCustomPopover={openCustomPopover}
          items={popoverListItems}
          handleClosePopover={handleClosePopover}
          handleClick={executeFunctions}
        />
      )}
    </>
  );
};

export default FabricDrawer;
