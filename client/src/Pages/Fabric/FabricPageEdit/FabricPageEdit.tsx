import React, { useState } from "react";
import { useSelector } from "react-redux";
import FabricCanvas from "./FabricCanvas";
import FabricOptions from "./FabricOptions";
import useEditHandlers from "./FabricHandlers/Edit.handlers";
import CanvasToolbar from "./FabricComponents/CanvasToolbar";
import FabricDrawer from "./FabricDrawer";
import useTutorialHandlers from "./FabricHandlers/Tutorial.handlers";
import PageLayoutBase from "../../../components/PageBlocks/PageLayoutBase";
import LoadingHOC from "../../../HOCS/LoadingHOC";
import { mockInitialDesign } from "../mockInitialDesign";

const FabricPageEdit = ({ initialDesign, screenIndex, setScreenIndex }) => {
  const {
    canvas,
    selectedDesign,
    setSelectedDesign,
    selectedObject,
    setSelectedObject,
    handleStartDrawing,
    canvasRef,
    designatedAreaRef,
    addNewScreenToDesign,
    changeDesignScreen,
    cursorState,
    setCursorState,
    zoomTextRef,
    landingAreaRectRef,
  } = useEditHandlers({
    initialDesign,
    screenIndex,
    setScreenIndex,
  });

  return (
    <PageLayoutBase
      title=""
      style={{
        width: "100%",
        paddingTop: 0,
        paddingInline: 0,
        overflow: "hidden",
      }}
    >
      <LoadingHOC
        isLoading={false}
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
        }}
      >
        <div
          className="editPage"
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            ref={designatedAreaRef}
            className="designatedArea"
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", zIndex: 3000 }}
            >
              <CanvasToolbar
                canvas={canvas}
                setSelectedObject={setSelectedObject}
                handleStartDrawing={handleStartDrawing}
                selectedDesign={selectedDesign}
                setSelectedDesign={setSelectedDesign}
                screenIndex={screenIndex}
                setScreenIndex={setScreenIndex}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "row", height: "100%" }}
            >
              <FabricDrawer
                canvas={canvas}
                setSelectedObject={setSelectedObject}
                handleStartDrawing={handleStartDrawing}
                selectedDesign={selectedDesign}
                setSelectedDesign={setSelectedDesign}
                screenIndex={screenIndex}
                addNewScreenToDesign={addNewScreenToDesign}
                changeDesignScreen={changeDesignScreen}
                cursorState={cursorState}
                setCursorState={setCursorState}
                zoomTextRef={zoomTextRef}
              />
              <FabricCanvas
                landingAreaRectRef={landingAreaRectRef}
                canvasRef={canvasRef}
                canvas={canvas}
                selectedObject={selectedObject}
                selectedDesign={selectedDesign}
                setSelectedObject={setSelectedObject}
                handleStartDrawing={handleStartDrawing}
                cursorState={cursorState}
                screenIndex={screenIndex}
                zoomTextRef={zoomTextRef}
              />
              <FabricOptions
                selectedObject={selectedObject}
                landingAreaRectRef={landingAreaRectRef}
                setSelectedObject={setSelectedObject}
                canvas={canvas}
                selectedDesign={selectedDesign}
                setSelectedDesign={setSelectedDesign}
                screenIndex={screenIndex}
              />
            </div>
          </div>
        </div>
        {/* <Tour
        steps={tourConfig}
        onRequestClose={handleCloseTutorial}
        isOpen={tutorialOpen}
        rounded={5}
        accentColor="#e51a29"
        className={classes.tutorial}
      /> */}
      </LoadingHOC>
    </PageLayoutBase>
  );
};

export default FabricPageEdit;
