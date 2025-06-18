import { Drawer } from "@mui/material";
import { fabric } from "fabric";
import React, { useEffect, useRef, useState } from "react";
import { makeStyles } from "tss-react/mui";
import CanvasAccordion from "./FabricComponents/CanvasAccordion";
import ObjectOptions from "./FabricComponents/ObjectOptions";
import useMultiMediaHandlers from "./FabricHandlers/MultiMedia.handlers";
import { useSelector } from "react-redux";

const drawerWidth = 320;

const TabComponentMapper = ({
  tab,
  canvas,
  selectedDesign,
  screenIndex,
  setSelectedDesign,
  selectedObject,
  setSelectedObject,
}) => {
  const componentMap = [
    {
      component: CanvasAccordion,
      props: {
        canvas,
        selectedDesign,
        screenIndex,
        setSelectedDesign,
      },
    },
    {
      component: ObjectOptions,
      props: {
        canvas,
        selectedDesign,
        selectedObject,
        setSelectedObject,
        screenIndex,
      },
    },
    // Add more components as needed
  ];

  const selectedTab = componentMap[tab];

  if (!selectedTab) {
    return null; // or render a default component/error message
  }

  const { component: SelectedComponent, props } = selectedTab;

  //TODO remove ts-ignore
  //@ts-ignore
  return <SelectedComponent {...props} />;
};

const useStyles = makeStyles()((theme) => ({
  drawer: {
    width: "15%",
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  drawerOpen: {
    width: drawerWidth,
    flexDirection: "column",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    top: "50px ",
  },
  drawerClose: {
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    top: "50px ",
  },
  firstChild: {
    display: "flex",
    flexDirection: "column",
    minWidth: "227px",
    marginInlineEnd: "3px",
    overflowY: "auto",
    overflowX: "hidden",
    height: "calc(100% - 140px)",
    transition: "transform 0.5s ease-out",
    position: "relative",
    "&:after": {
      display: "block",
      bottom: 12,
      content: '""',
      position: "fixed",
      width: "100%",
      background: `linear-gradient(to bottom,rgba(33, 34, 39, 0),${theme.palette.background.default})`,
      height: "5.5 %",
      zIndex: 2,
    },
  },
  "@media (min-width: 600px)": {
    tabRoot: {
      minWidth: "72px",
    },
  },
}));

const FabricOptions = ({
  selectedObject,
  setSelectedObject,
  canvas,
  selectedDesign,
  setSelectedDesign,
  screenIndex,
  landingAreaRectRef,
}) => {
  const { classes, cx } = useStyles();

  const drawerRef = useRef();
  const tab = selectedObject ? 1 : 0;

  const startDrawing = useSelector(
    (state: any) => state.fabricPageReducer.startDrawing
  );

  const { addMedia } = useMultiMediaHandlers({ canvas });

  const [state, setState] = useState({
    uploadFinished: false,
    showCancelUploadsDownloadsDialog: false,
    filesToUpload: [],
    uploadDownloadScreenMinimized: false,
    simpleDialogMsg: "",
    showSimpleDialog: false,
    showUploadAndReplaceFiles: false,
    uploadAndReplaceFilesMsg: "",
    showUploadDialog: false,
    folderFilesToUpload: [],
    fileDropped: null,
  });

  useEffect(() => {
    if (canvas) {
      canvas.on("drop", function (event) {
        event.e.preventDefault();
        console.log("drop", event);
      });
    }
  }, [canvas]);

  useEffect(() => {
    if (state?.fileDropped) {
      if (state.fileDropped.success) {
        const newLandingAreaRect = new fabric.Rect({
          width: landingAreaRectRef.current.width, // Set your desired landing area width
          height: landingAreaRectRef.current.height, // Set your desired landing area height
          fill: "rgba(255, 255, 255, 1)", // Adjust the fill color and opacity
          stroke: "rgba(255,255,255,1)",
          strokeWidth: 1,
          originX: "left",
          originY: "top",
          left: landingAreaRectRef.current.left,
          top: landingAreaRectRef.current.top,
          selectable: false,
          evented: false,
        });

        addMedia([state.fileDropped], newLandingAreaRect);
        landingAreaRectRef.current = null;
        let updatedState = { ...state };
        updatedState.fileDropped.success = false;
        setState(updatedState);
      }
    }
  }, [state?.fileDropped]);

  return (
    <>
      <Drawer
        variant="permanent"
        className={cx(classes.drawer, {
          [classes.drawerOpen]: true,
        })}
        classes={{
          paper: classes.drawerOpen,
        }}
        anchor="right"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
          ref={drawerRef as any}
        ></div>
        <div className={classes.firstChild} data-tut="TabChild">
          <TabComponentMapper
            tab={tab}
            canvas={canvas}
            selectedDesign={selectedDesign}
            setSelectedDesign={setSelectedDesign}
            selectedObject={selectedObject}
            setSelectedObject={setSelectedObject}
            screenIndex={screenIndex}
          />
        </div>
      </Drawer>

      {startDrawing && (
        <div
          style={{
            position: "fixed",
            top: 64,
            right: 0,
            width: "320px",
            minWidth: "227px",
            height: "100%",
            background: "rgba(0, 0, 0, 0.3)", // semi-transparent background
            zIndex: 1205,
          }}
        />
      )}
    </>
  );
};

export default FabricOptions;
