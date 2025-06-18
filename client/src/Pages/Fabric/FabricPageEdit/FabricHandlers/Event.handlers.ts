import { useEffect, useRef } from "react";
import { fabric } from "fabric";
import useMultiMediaHandlers from "./MultiMedia.handlers";
import useObjectCustomizationHandlers from "./ObjectCustomization.handlers";
import { multiMediaObjectFit } from "../FabricComponents/MultimediaHelper";
import CustomItemsPicker from "../FabricItemsSchema/CustomItemsPicker";
import { createSnapshotOfElement } from "../FabricComponents/CustomElementsHelper";
import { useDrop } from "react-dnd";
import DragAndDropItemTypes from "../../../../components/DragAndDrop/DragAndDropItemTypes";
import useDrawingHandlers from "./oldLinehandler";
import { findLineBasedOnCursosPos } from "../FabricComponents/TextEditor";
import _ from "lodash";
import { store } from "../../../../reduxConfig/reduxStoreConfig";
import { useAppSelector } from "../../../../reduxConfig/reduxHooks";

const useEventHandlers = ({
  canvas,
  onContextMenu,
  landingAreaRectRef,
  movingGuidelines,
  selectedObject,
  setSelectedObject,
  selectedDesign,
  cursorState,
  screenIndex,
  zoomText,
}) => {
  const { findDynamicRanges, setAngle, updateSizeAndPosition } =
    useObjectCustomizationHandlers({
      canvas: canvas,
      selectedObject: selectedObject,
      setSelectedObject: setSelectedObject,
      selectedDesign: selectedDesign,
      screenIndex: screenIndex,
    });
  const { addMedia, addDroppedMediaFromPC } = useMultiMediaHandlers({
    canvas: canvas,
  });

  const {
    createLine,
    previewLine,
    createPolygon,
    cancelLine,
    previewPolygon,
    activeLine,
    pointArray,
    updateLine,
    createCirclesForLine,
    removeCirclesFromLines,
    createArea,
  } = useDrawingHandlers({
    canvas: canvas,
  });

  const drawingType = useAppSelector(
    (state) => state.fabricPageReducer.drawingType
  );
  const startDrawing = useAppSelector(
    (state) => state.fabricPageReducer.startDrawing
  );
  const selectArea = useAppSelector(
    (state) => state.fabricPageReducer.selectArea
  );
  const startPointer = useAppSelector(
    (state) => state.fabricPageReducer.startingPointer
  );

  const previousTargetRef = useRef(null);

  const deleteDynamicWord = (activeObj, backspace) => {
    // assuming activeObj is your IText object
    let objText = activeObj.text;
    const { line, startLineIdx } = findLineBasedOnCursosPos(
      activeObj.text.split("\n"),
      activeObj.selectionStart
    );
    let cursorPosDelete;
    if (backspace) {
      // get the index of the last character before the cursor
      const cursorIndex = activeObj.selectionStart - 1;

      if (cursorIndex >= 0) {
        // ensure cursor is not at the beginning of the text
        // check whether the last character before the cursor has style.type === "dynamic"
        const styles = activeObj.getStyleAtPosition(cursorIndex);

        if (styles && styles.type === "dynamic") {
          // iterate backwards from the cursor until the start of the current word is found
          let endIndex = cursorIndex + 1;
          let startIndex = endIndex;
          const objText = activeObj.text;
          while (startIndex > 0 && objText[startIndex - 1] !== " ") {
            startIndex--;
          }

          // Get the deleted word and its length
          const deletedWord = objText.slice(startIndex, endIndex);
          const deletedLength = endIndex - startIndex;

          //get cursorPosition to be after deletion
          cursorPosDelete = startIndex;
          // remove the matched word from the original string
          const newText =
            objText.slice(0, startIndex) + objText.slice(endIndex);

          // Remove dynamic styling from the word
          let newStyles = {};
          const stylesKeys = Object.keys(activeObj.styles[line] || {});

          stylesKeys.forEach((key) => {
            const intKey = parseInt(key, 10);
            if (
              intKey < startIndex - startLineIdx ||
              intKey >= endIndex - startLineIdx
            ) {
              let newKey = intKey;
              // Adjust style indices for remaining text
              if (intKey >= endIndex - startLineIdx) {
                newKey -= deletedLength;
              }
              newStyles = Object.assign(newStyles, {
                [newKey]: activeObj.styles[line][key],
              });
            }
          });

          //remove current dynamic styling
          const dynamicRanges = findDynamicRanges(activeObj, line);
          // Sort the dynamicRanges array in reverse order
          dynamicRanges.sort((a, b) => b.start - a.start);
          // Remove styles from dynamicRanges
          dynamicRanges.forEach((range) => {
            if (range.start == startIndex) {
              for (let i = range.start; i <= range.end; i++) {
                delete activeObj.styles[line][i];
              }
            }
          });
          // activeObj.styles[line] = newStyles;
          activeObj.setSelectionStart(startIndex);
          activeObj.setSelectionEnd(endIndex);

          // activeObj.set("text", "");
          // // re-render the canvas
          // canvas.renderAll();
          // addDynamicText(newText, "delete", cursorPosDelete);
          canvas.renderAll();
        }
      }
    } else {
      const cursorIndex = activeObj.selectionStart;
      const styles = activeObj.getStyleAtPosition(cursorIndex);
      if (styles && styles.type === "dynamic") {
        // find the start and end indices of the next word
        let startIndex = cursorIndex;
        let endIndex = cursorIndex + 1;
        while (
          endIndex < objText.length &&
          objText[endIndex] !== " " &&
          activeObj.getStyleAtPosition(endIndex).type === "dynamic"
        ) {
          endIndex++;
        }
        // extract the matched word and remove it from the original string
        const word = objText.slice(startIndex, endIndex);
        const deletedLength = endIndex - startIndex;
        const newText = objText.slice(0, startIndex) + objText.slice(endIndex);

        //get cursorPosition to be after deletion
        cursorPosDelete = startIndex;

        // Remove dynamic styling from the word
        let newStyles = {};
        const stylesKeys = Object.keys(activeObj.styles[line] || {});

        stylesKeys.forEach((key) => {
          const intKey = parseInt(key, 10);
          if (
            intKey < startIndex - startLineIdx ||
            intKey >= endIndex - startLineIdx
          ) {
            let newKey = intKey;
            // Adjust style indices for remaining text
            if (intKey > startIndex) {
              newKey -= deletedLength;
            }
            newStyles = Object.assign(newStyles, {
              [newKey]: activeObj.styles[line][key],
            });
          }
        });

        //remove current dynamic styling
        const dynamicRanges = findDynamicRanges(activeObj, line);
        // Sort the dynamicRanges array in reverse order
        dynamicRanges.sort((a, b) => b.start - a.start);
        // Remove styles from dynamicRanges
        dynamicRanges.forEach((range) => {
          if (range.start == startIndex) {
            for (let i = range.start; i <= range.end; i++) {
              delete activeObj.styles[line][i];
            }
          }
        });
        activeObj.setSelectionStart(startIndex);
        activeObj.setSelectionEnd(endIndex);
        // activeObj.styles[line] = newStyles;
        // activeObj.set("text", "");
        // // re-render the canvas
        canvas.renderAll();
        // addDynamicText(newText, "delete", cursorPosDelete);
      }
    }
  };

  const handleDynamicTextCursor = (activeObj, event) => {
    if (!activeObj || activeObj.type !== "IText") {
      return; // nothing to do
    }

    const text = activeObj.text;
    const startIdx = activeObj.selectionStart;

    const textLines = activeObj.textLines;
    const { line, startLineIdx, endLineIdx } = findLineBasedOnCursosPos(
      textLines,
      startIdx
    );

    const charBefore = startIdx > 0 ? startIdx - 1 : null;
    const charCurrent = startIdx;
    const charAfter = startIdx < endLineIdx ? startIdx : null;

    const styleBefore =
      charBefore != null ? activeObj.getStyleAtPosition(charBefore) : null;
    const styleAfter =
      charAfter != null ? activeObj.getStyleAtPosition(charAfter) : null;
    const onlyBefore =
      styleBefore &&
      styleBefore.type === "dynamic" &&
      styleAfter?.type !== "dynamic";
    const onlyAfter =
      styleAfter &&
      styleAfter.type === "dynamic" &&
      styleBefore?.type !== "dynamic";

    if (onlyBefore) {
      if (event.key == "Backspace") {
        deleteDynamicWord(activeObj, true);
      } else {
        activeObj.setSelectionStart(startIdx + 1);
        activeObj.setSelectionEnd(startIdx + 1);
      }
    } else if (onlyAfter) {
      if (event.key == "Delete") {
        deleteDynamicWord(activeObj, false);
      } else {
        activeObj.setSelectionStart(startIdx - 1);
        activeObj.setSelectionEnd(startIdx - 1);
      }
    } else if (
      styleBefore &&
      styleBefore.type === "dynamic" &&
      styleAfter &&
      styleAfter.type === "dynamic"
    ) {
      event.stopPropagation();
      event.preventDefault();
      return;
    } else canvas.renderAll();
  };

  useEffect(() => {
    const handleMouseDown = (event) => {
      const isSelectionEnabled = canvas.get("selection");
      if (event.e.buttons == 1 && !isSelectionEnabled) {
        canvas.lastPosX = event.e.clientX;
        canvas.lastPosY = event.e.clientY;
      }
      if (event.button == 1) {
        if (startDrawing) {
          if (drawingType == "Line") {
            createLine(event);
          } else if (drawingType == "polygon") {
            createPolygon(event);
          }
        } else if (selectArea) {
          createArea(startPointer, event);
        }
      }
    };
    const handleMouseMove = (event) => {
      const isSelectionEnabled = canvas.get("selection");
      if (event.e.buttons == 1 && !isSelectionEnabled) {
        const e = event.e;
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        const zoom = canvas.getZoom();
        const vpt = canvas.viewportTransform;

        // Update the viewportTransform based on mouse movement
        vpt[4] += e.clientX - canvas.lastPosX;
        vpt[5] += e.clientY - canvas.lastPosY;

        // 4 conditions for border limitations

        if (vpt[4] > 0) {
          vpt[4] = Math.min(vpt[4], 0);
        } else if (vpt[4] < -canvasWidth * (zoom - 1)) {
          vpt[4] = Math.max(vpt[4], -canvasWidth * (zoom - 1));
        }
        if (vpt[5] > 0) {
          vpt[5] = Math.min(vpt[5], 0);
        } else if (vpt[5] < -canvasHeight * (zoom - 1)) {
          vpt[5] = Math.max(vpt[5], -canvasHeight * (zoom - 1));
        }

        // Request re-rendering of the canvas
        canvas.requestRenderAll();

        // Update lastPosX and lastPosY for the next event
        canvas.lastPosX = e.clientX;
        canvas.lastPosY = e.clientY;
      }
      if (!event.target?.selectable) {
        canvas.hoverCursor = "default";
      } else canvas.hoverCursor = "pointer";
      const drawingMode = store.getState().fabricPageReducer.startDrawing;

      if (drawingMode) {
        if (drawingType == "Line") {
          previewLine(event);
        } else if (drawingType == "polygon") {
          previewPolygon(event);
        }
      }
    };
    const handleMouseUp = (event) => {
      const isSelectionEnabled = canvas.get("selection");
      if (event.e.buttons == 0 && !isSelectionEnabled) {
        canvas.setViewportTransform(canvas.viewportTransform);
      }
      if (selectArea && startPointer) {
        createArea(startPointer, event);
      }
    };

    // document.onkeydown = function (e) {
    //   const keycode = e.key;
    //   if (keycode == "Escape") {
    //     if (startDrawing) {
    //       cancelLine(canvas);
    //     }
    //   }
    // };
    // Add the mouse down event listener if canvas is defined
    canvas?.on?.("mouse:down", handleMouseDown);
    canvas?.on?.("mouse:move", handleMouseMove);
    canvas?.on?.("mouse:up", handleMouseUp);

    // Return the cleanup function to remove the event listener if canvas is defined
    return () => {
      canvas?.off?.("mouse:down", handleMouseDown);
      canvas?.off?.("mouse:down", handleMouseMove);
      canvas?.off?.("mouse:up", handleMouseUp);
    };
  }, [
    canvas,
    drawingType,
    startDrawing,
    activeLine,
    pointArray,
    selectArea,
    startPointer,
    cursorState,
  ]);

  const [{ isOver }, drop] = useDrop({
    accept: [DragAndDropItemTypes.FILE, DragAndDropItemTypes.PLAYLIST], // Specify the accepted item type (must match the draggable's item type)
    drop: (item, monitor) => {
      // Handle the dropped item here
      const itemData: any = item;
      // Get the canvas element
      const canvasElement = canvas.upperCanvasEl || canvas.lowerCanvasEl;
      const newLandingAreaRect = new fabric.Rect({
        width: landingAreaRectRef.current.dimensions.width, // Set your desired landing area width
        height: landingAreaRectRef.current.dimensions.height, // Set your desired landing area height
        fill: "#FFFFFFFF", // Adjust the fill color and opacity
        stroke: "#FFFFFF",
        strokeWidth: 0,
        originX: "left",
        originY: "top",
        left: landingAreaRectRef.current.dimensions.left,
        top: landingAreaRectRef.current.dimensions.top,
        selectable: false,
        evented: false,
      });
      if (itemData.Type == "Media") addMedia([itemData], newLandingAreaRect);
      else addMedia([itemData], newLandingAreaRect);
      landingAreaRectRef.current = null;
      const drawer = document.getElementById("SecondDrawerV2");
      if (drawer) {
        drawer.style.transition = "opacity 0.3s"; // Add a transition to opacity with a duration of 0.3 seconds
        if (drawer.style.opacity == "0") drawer.style.opacity = "1";
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const getWordBoundaries = (text, index) => {
    let start = index;
    let end = index;

    // Move start to the beginning of the word
    while (start > 0 && /\S/.test(text.charAt(start - 1))) {
      start--;
    }

    // Move end to the end of the word
    while (end < text.length && /\S/.test(text.charAt(end))) {
      end++;
    }

    return { start, end };
  };

  useEffect(() => {
    if (canvas) {
      canvas.on("object:moving", function (options) {
        if (options.target) {
          const target = options.target;
          if (!target.isPoint) {
            movingGuidelines(target, false);
          }
          if (target.type === "activeSelection") {
            return;
          }
          if (
            (target.id == "pointer-1" || target.id == "pointer-2") &&
            target.isPoint
          ) {
            updateLine(target);
          } else if (target.type == "Line") {
            removeCirclesFromLines();
          }
        }
      });
      // Register double-click event on the canvas
      canvas.on("mouse:dblclick", function (options) {
        // Check if the target that is double-clicked has the type "Multimedia"
        if (options.target && options.target.type === "Multimedia") {
          const multimediaGroup = options.target; // The group containing backgroundRect and media

          // Obtain the backgroundRect and media objects from the group
          const backgroundRect = multimediaGroup.item(0);
          const media = multimediaGroup.item(1);

          const mediaHeight = media.getScaledHeight();
          const mediaWidth = media.getScaledWidth();

          //Difference in left,top between rect and media
          const diffLeft = (backgroundRect.width - mediaWidth) / 2;
          const diffTop = (backgroundRect.height - mediaHeight) / 2;

          // Calculate the new dimensions for the backgroundRect to match the media's size
          const newBackgroundWidth = media.getScaledWidth();
          const newBackgroundHeight = media.getScaledHeight();

          // Update the backgroundRect's dimensions
          backgroundRect.set({
            width: newBackgroundWidth,
            height: newBackgroundHeight,
          });

          // Re-center the media inside the updated backgroundRect
          const scaleX = newBackgroundWidth / media.width;
          const scaleY = newBackgroundHeight / media.height;
          const scale = Math.min(scaleX, scaleY);
          media.set({
            scaleX: scale,
            scaleY: scale,
            clipPath: null,
          });

          // Recalculate the position of the media to keep it centered inside the updated backgroundRect
          const newMediaLeft =
            backgroundRect.left +
            (backgroundRect.width - media.getScaledWidth()) / 2;
          const newMediaTop =
            backgroundRect.top +
            (backgroundRect.height - media.getScaledHeight()) / 2;
          media.set({
            left: newMediaLeft,
            top: newMediaTop,
          });

          // Update the group's dimensions to match the new backgroundRect size
          multimediaGroup.set({
            top: multimediaGroup.top + diffTop,
            left: multimediaGroup.left + diffLeft,
            width: newBackgroundWidth,
            height: newBackgroundHeight,
          });

          // Update the canvas
          canvas.renderAll();
        }
      });
      canvas.on("object:scaling", function (event) {
        const target = event.target;
        if (target && !target.isPoint && event.action !== "noLines") {
          movingGuidelines(target, true);
        }
        if (target.type === "Multimedia") {
          if (target.path !== "") {
            // Get the objects within the group
            const objects = target.getObjects();
            const newWidth = target.width * target.scaleX;
            const newHeight = target.height * target.scaleY;

            const backgroundRect = objects[0];
            const media = objects[1];

            target.set({
              width: newWidth,
              height: newHeight,
              scaleX: 1,
              scaleY: 1,
              ZoomX: 1,
              ZoomY: 1,
            });
            backgroundRect.set({
              width: newWidth,
              height: newHeight,
              scaleX: 1,
              scaleY: 1,
              ZoomX: 1,
              ZoomY: 1,
            });
            if (objects.length > 1 && media.getElement().localName == "img") {
              multiMediaObjectFit(
                canvas,
                backgroundRect,
                media,
                media.objectFit
              );
            }
          } else {
            const newWidth = target.width * target.scaleX;
            const newHeight = target.height * target.scaleY;
            target.set({
              width: newWidth,
              height: newHeight,
              scaleX: 1,
              scaleY: 1,
              ZoomX: 1,
              ZoomY: 1,
            });
            target.setCoords();
            canvas.renderAll();
          }
        } else {
          const newWidthTarget = target.width * target.scaleX;
          const newHeightTarget = target.height * target.scaleY;
          if (newWidthTarget < target.minWidth) {
            target.set({
              width: target.width,
              height: target.height,
              left: target.left,
              top: target.top,
              scaleX: 1,
              scaleY: 1,
              ZoomX: 1,
              ZoomY: 1,
            });
            // Re-render the canvas to reflect changes
            target.setCoords();
            canvas.renderAll();
          } else {
            if (target.type == "activeSelection") {
              target.getObjects().forEach((obj) => {
                if (obj.type == "Multimedia") {
                  if (obj.path !== "") {
                    // Get the objects within the group
                    const objects = obj.getObjects();
                    const newWidthObj = obj.width * target.scaleX;
                    const newHeightObj = obj.height * target.scaleY;

                    const backgroundRect = objects[0];
                    const media = objects[1];

                    obj.set({
                      width: newWidthObj,
                      height: newHeightObj,
                      left: obj.left * target.scaleX,
                      top: obj.top * target.scaleY,
                      scaleX: 1,
                      scaleY: 1,
                      ZoomX: 1,
                      ZoomY: 1,
                    });

                    backgroundRect.set({
                      width: newWidthObj,
                      height: newHeightObj,
                      scaleX: 1,
                      scaleY: 1,
                      ZoomX: 1,
                      ZoomY: 1,
                    });
                    if (
                      objects.length > 1 &&
                      media.getElement().localName == "img"
                    ) {
                      multiMediaObjectFit(
                        canvas,
                        backgroundRect,
                        media,
                        media.objectFit
                      );
                    }
                  }
                } else {
                  const newWidthObj = obj.width * target.scaleX;
                  const newHeightObj = obj.height * target.scaleY;
                  const newLeftObj = obj.left * target.scaleX;
                  const newTopObj = obj.top * target.scaleY;
                  if (obj.type == "Ellipse") {
                    const newRxObj = obj.rx * target.scaleX;
                    const newRyObj = obj.ry * target.scaleY;
                    obj.set({
                      rx: newRxObj,
                      ry: newRyObj,
                    });
                  }
                  obj.set({
                    width: newWidthObj,
                    height: newHeightObj,
                    left: newLeftObj,
                    top: newTopObj,
                    scaleX: 1,
                    scaleY: 1,
                    ZoomX: 1,
                    ZoomY: 1,
                  });
                }
              });
            }
            if (target.type == "Ellipse")
              target.set({
                ry: newHeightTarget / 2,
                rx: newWidthTarget / 2,
              });
            target.set({
              width: newWidthTarget,
              height: newHeightTarget,
              scaleX: 1,
              scaleY: 1,
              ZoomX: 1,
              ZoomY: 1,
            });
          }

          // target.setCoords();
          // canvas.requestRenderAll();
        }
        if (target.superType) {
          if (target.width < 30 || target.height < 30) {
            target.controls.deleteControl.offsetX = 16;
            target.controls.deleteControl.offsetY = -16;
          } else {
            target.controls.deleteControl.offsetX = -16;
            target.controls.deleteControl.offsetY = 16;
          }
        }
      });
      canvas.on("object:removed", function (event) {
        if (!event.target.superType) setSelectedObject(null);
      });
      canvas.on("mouse:up", function () {
        const activeObject = canvas.getActiveObject();
        if (
          activeObject &&
          activeObject.type == "IText" &&
          activeObject.isEditing
        ) {
          const { selectionStart, selectionEnd } = activeObject;
          let charStyle;

          if (selectionStart !== selectionEnd) {
            const { line } = findLineBasedOnCursosPos(
              activeObject.text.split("\n"),
              selectionStart
            );

            const hasCharTextStyling =
              !!activeObject.styles[line] &&
              Object.keys(activeObject.styles[line]).length > 0;

            charStyle = hasCharTextStyling
              ? activeObject.styles[line][
                  selectionStart == 0 ? selectionStart + 1 : selectionStart
                ]
              : null;
            if (charStyle && charStyle.type == "dynamic") {
              const wordBoundaries = getWordBoundaries(
                activeObject.text,
                selectionStart
              );
              activeObject.setSelectionStart(wordBoundaries.start);
              activeObject.setSelectionEnd(wordBoundaries.end);
              canvas.renderAll();
            }
          }
        }
      });
      canvas.on("selection:created", function (event) {
        if (event.selected && event.selected.length > 1) {
          const selection = canvas.getActiveObject();
          selection.set("type", "activeSelection");

          // Track minimum width and height
          let minWidth = 0;

          // Check for Textbox objects in the selection
          selection.getObjects().forEach((obj) => {
            if (obj.type === "IText") {
              minWidth = Math.max(
                minWidth,
                (obj.dynamicMinWidth / obj.width) * selection.width
              );
            }
          });
          selection.set({
            minWidth: minWidth,
          });
          setSelectedObject(selection);
        }
      });
      canvas.on("mouse:down", (event) => {
        const isSelectionEnabled = canvas.get("selection");
        if (event.target && event.target.type !== "addMediaArea") {
          if (
            event.target.id == "pointer-1" ||
            event.target.id == "pointer-2"
          ) {
            const line = canvas
              .getObjects()
              .find((o) => o.id == event.target.referenceId);
            setSelectedObject(line);
          } else {
            setSelectedObject(event.target);
            canvas.fire("otherObject:selected", { target: event.target });
          }
          if (event.target.type == "Line") createCirclesForLine(event.target);
        } else {
          removeCirclesFromLines();
          setSelectedObject(null);
        }
        // event.e.preventDefault();
        // event.e.stopPropagation();
        if (event.button === 3 && isSelectionEnabled) {
          if (
            (event.target &&
              event.target.type !== "addMediaArea" &&
              event.target.type !== "Line") ||
            (event.target && event.target.isPoint)
          ) {
            canvas.setActiveObject(event.target);
            canvas.fire("otherObject:selected", { target: event.target });
          }
          event.e.preventDefault();
          event.e.stopPropagation();
          onContextMenu(event);
        }
        if (event.target && event.target.superType) {
          if (event.target.width < 30 || event.target.height < 30) {
            event.target.controls.deleteControl.offsetX = 16;
            event.target.controls.deleteControl.offsetY = -16;
          } else {
            event.target.controls.deleteControl.offsetX = -16;
            event.target.controls.deleteControl.offsetY = 16;
          }
        }
      });
      canvas.on("object:modified", function (e) {
        // Rerender custom objects and add circles to lines
        const modifiedObject = e.target;
        if (e.action == "rotate") {
          setAngle(e.target.angle);
        }
        // Trigger rerender of custom elements if scale changed
        if (modifiedObject.superType == "customObject") {
          if (
            e.action == "scale" ||
            e.action == "scaleY" ||
            e.action == "scaleX"
          ) {
            const objSettings = {
              ...modifiedObject,
              ...modifiedObject.settings,
              size: {
                width: modifiedObject.width,
                height: modifiedObject.height,
              },
            };

            const element = CustomItemsPicker({
              canvasDimension: {
                width: canvas.width / canvas.viewportZoom,
                height: canvas.height / canvas.viewportZoom,
              },
              screenDimension:
                selectedDesign.Configuration.screens[screenIndex].resolution,
              type: modifiedObject.type,
              ...objSettings,
            });
            createSnapshotOfElement(
              element,
              modifiedObject,
              canvas,
              modifiedObject.type
            );
          }
        } else if (modifiedObject.type == "Line") {
          createCirclesForLine(modifiedObject);
        } else if (modifiedObject.type == "activeSelection") {
          const objects = modifiedObject.getObjects();
          objects.forEach((object) => {
            if (object.superType) {
              if (
                e.action == "scale" ||
                e.action == "scaleY" ||
                e.action == "scaleX"
              ) {
                const objSettings = {
                  ...object,
                  ...object.settings,
                  left:
                    modifiedObject.left +
                    (object.left + modifiedObject.width / 2),
                  top:
                    modifiedObject.top +
                    (object.top + modifiedObject.height / 2),
                  size: {
                    width: object.width,
                    height: object.height,
                  },
                };

                const element = CustomItemsPicker({
                  canvasDimension: {
                    width: canvas.width / canvas.viewportZoom,
                    height: canvas.height / canvas.viewportZoom,
                  },
                  screenDimension:
                    selectedDesign.Configuration.screens[screenIndex]
                      .resolution,
                  type: object.type,
                  ...objSettings,
                });
                createSnapshotOfElement(
                  element,
                  {
                    ...object,
                    left:
                      modifiedObject.left +
                      (object.left + modifiedObject.width / 2),
                    top:
                      modifiedObject.top +
                      (object.top + modifiedObject.height / 2),
                  },
                  canvas,
                  object.type
                );
              }
            }
          });
        }
        canvas.renderAll();
      });
      // Prevent default behavior for drop events to allow dropping
      canvas.on("dragover", function (event) {
        event.e.preventDefault();
        const drawer = document.getElementById("SecondDrawerV2");
        if (drawer) {
          drawer.style.transition = "opacity 0.3s"; // Add a transition to opacity with a duration of 0.3 seconds
          if (drawer.style.opacity == "1") drawer.style.opacity = "0";
        }
        let dimensions;
        if (
          event.target &&
          previousTargetRef.current === event.target &&
          event.target.type == "addMediaArea"
        ) {
          return; // Skip if the target hasn't changed
        }

        previousTargetRef.current = event.target; // Update the previous target
        console.log("🚀 ~ event:", event);

        if (event.target && event.target.type == "addMediaArea") {
          const target = event.target;
          dimensions = {
            left: target.left,
            top: target.top,
            width: target.width,
            height: target.height,
            onTarget: true,
          };
        } else {
          dimensions = {
            left: event.e.layerX - 75,
            top: event.e.layerY - 70,
            width:
              selectedDesign.Configuration.screens[screenIndex].orientation ==
              "landscape"
                ? 576
                : 154,
            height:
              selectedDesign.Configuration.screens[screenIndex].orientation ==
              "landscape"
                ? 324
                : 275,
            onTarget: false,
          };
        }
        if (!landingAreaRectRef.current) {
          // Create a temporary rectangle representing the landing area
          const newLandingAreaRect = new fabric.Rect({
            width: dimensions.width, // Set your desired landing area width
            height: dimensions.height, // Set your desired landing area height
            fill: dimensions.onTarget ? "#00FF004C" : "#BDBDBDFF", // Adjust the fill color and opacity
            originX: "left",
            originY: "top",
            left: dimensions.left,
            top: dimensions.top,
            selectable: false,
            evented: false,
            dimensions: {
              left: dimensions.left,
              top: dimensions.top,
              width: dimensions.width,
              height: dimensions.height,
            },
          });
          canvas.add(newLandingAreaRect);
          landingAreaRectRef.current = newLandingAreaRect;
        } else {
          if (event.target && event.target.type == "addMediaArea") {
            // Smoothly update the position and size of the landing area rectangle
            const animationDuration = 100; // Adjust the duration as needed
            landingAreaRectRef.current.set({
              fill: "#00FF004C",
              dimensions: {
                left: dimensions.left,
                top: dimensions.top,
                width: dimensions.width,
                height: dimensions.height,
              },
            });
            landingAreaRectRef.current.animate(
              {
                left: dimensions.left,
                top: dimensions.top,
                width: dimensions.width,
                height: dimensions.height,
              },
              {
                duration: animationDuration,
                onChange: canvas.renderAll.bind(canvas), // Update canvas during animation
                onComplete: () => {
                  landingAreaRectRef.current.set(
                    "fill",
                    dimensions.onTarget ? "#00FF004C" : "#BDBDBDFF"
                  );
                  // Ensure final render
                  canvas.renderAll.bind(canvas);
                },
                easing: fabric.util.ease.easeOutQuad,
              }
            );
          } else {
            // Update the position of the landing area rectangle while dragging
            landingAreaRectRef.current.set({
              left: dimensions.left,
              top: dimensions.top,
              width: dimensions.width,
              height: dimensions.height,
              fill: dimensions.onTarget ? "#00FF004C" : "#BDBDBDFF", // Adjust the fill color and opacity
            });
            canvas.requestRenderAll();
          }
        }
      });
      canvas.on("dragleave", function () {
        canvas.remove(landingAreaRectRef.current);
        canvas.requestRenderAll();
        landingAreaRectRef.current = null;
        const drawer = document.getElementById("SecondDrawerV2");
        if (drawer) {
          drawer.style.transition = "opacity 0.3s"; // Add a transition to opacity with a duration of 0.3 seconds
          if (drawer.style.opacity == "0") drawer.style.opacity = "1";
        }
      });
      canvas.on("drop", function (event) {
        event.e.preventDefault();
        const targetArea = event.target;
        if (targetArea && targetArea.type == "addMediaArea") {
          const elementToDelete = document.querySelector(
            `[data-name=${targetArea.dataName}]`
          );
          document.body.removeChild(elementToDelete);
          canvas.remove(targetArea);
        }
        canvas.remove(landingAreaRectRef.current);
        canvas.requestRenderAll();
      });
      canvas.on("mouse:wheel", function (opt) {
        const delta = opt.e.deltaY;
        let zoom = canvas.scrollingZoom;
        const viewportZoom = canvas.viewportZoom;

        const canvasContainer: HTMLElement =
          document.querySelector(".canvas-container");
        if (delta > 0 && zoom == 1) {
          canvas.setViewportTransform([viewportZoom, 0, 0, viewportZoom, 0, 0]);
        } else {
          zoom *= 0.9996 ** delta;
          if (zoom > 4) zoom = 4;
          if (zoom < 1) zoom = 1;
          canvas.zoomToPoint(
            { x: opt.e.offsetX, y: opt.e.offsetY },
            zoom * viewportZoom
          );
          opt.e.preventDefault();
          opt.e.stopPropagation();
          const vpt = canvas.viewportTransform;
          if (zoom < viewportZoom) {
            canvas.setViewportTransform([
              viewportZoom,
              0,
              0,
              viewportZoom,
              0,
              0,
            ]);
            canvas.set("scrollingZoom", 1);
            zoomText.current.value = Math.round(zoom * 100) + "%";
          } else {
            const canvasWidth = canvas.getWidth() * viewportZoom;
            const canvasHeight = canvas.getHeight() * viewportZoom;
            if (vpt[4] >= 0) {
              vpt[4] = 0;
            } else if (
              vpt[4] <
              canvasWidth - canvasContainer.offsetWidth * zoom * viewportZoom
            ) {
              vpt[4] =
                canvasWidth - canvasContainer.offsetWidth * zoom * viewportZoom;
            }
            if (vpt[5] >= 0) {
              vpt[5] = 0;
            } else if (
              vpt[5] <
              canvasHeight - canvasContainer.offsetHeight * zoom * viewportZoom
            ) {
              vpt[5] =
                canvasHeight -
                canvasContainer.offsetHeight * zoom * viewportZoom;
            }
            canvas.set("scrollingZoom", zoom);
            zoomText.current.value = Math.round(zoom * 100) + "%";
          }
        }
      });
      document.onkeydown = function (e) {
        const objSelected = canvas.getActiveObject() || selectedObject;
        const keycode = e.key;

        if (keycode == "Escape" && startDrawing) {
          cancelLine(canvas);
        }
        const canvasRatio =
          (selectedDesign.Configuration.screens[screenIndex].resolution.width /
            canvas.width) *
          canvas.viewportZoom;

        if (objSelected) {
          if (objSelected.type == "IText" && objSelected.isEditing) {
            handleDynamicTextCursor(objSelected, e);
          } else if (objSelected.type === "activeSelection") {
            // Check if any TextField is focused
            const focusedTextField = document.activeElement;
            const isTextFieldFocused =
              focusedTextField.tagName === "INPUT" &&
              ((focusedTextField as HTMLInputElement).type === "text" ||
                (focusedTextField as HTMLInputElement).type === "number");
            if (!isTextFieldFocused) {
              switch (keycode) {
                case "Delete":
                  objSelected.forEachObject(function (obj) {
                    canvas.remove(obj);
                  });
                  canvas.discardActiveObject();
                  setSelectedObject(null);
                  canvas.fire("objectPos:changed", { canvas: canvas });
                  canvas.renderAll();

                case "ArrowUp":
                  updateSizeAndPosition(
                    "top",
                    _.round(objSelected.top * canvasRatio - 1)
                  );
                  break;
                case "ArrowDown":
                  updateSizeAndPosition(
                    "top",
                    _.round(objSelected.top * canvasRatio + 1)
                  );
                  break;
                case "ArrowLeft":
                  updateSizeAndPosition(
                    "left",
                    _.round(objSelected.left * canvasRatio - 1)
                  );
                  break;
                case "ArrowRight":
                  updateSizeAndPosition(
                    "left",
                    _.round(objSelected.left * canvasRatio + 1)
                  );
                  break;
                default:
                  break;
              }
            }
          } else if (objSelected.type !== "IText" || !objSelected.isEditing) {
            // Check if any TextField is focused
            const focusedTextField = document.activeElement;
            const isTextFieldFocused =
              focusedTextField.tagName === "INPUT" &&
              ((focusedTextField as HTMLInputElement).type === "text" ||
                (focusedTextField as HTMLInputElement).type === "number");
            if (!isTextFieldFocused) {
              switch (keycode) {
                case "Delete":
                  canvas.remove(objSelected);
                  setSelectedObject(null);
                  if (objSelected.type == "Line") removeCirclesFromLines();
                  canvas.fire("objectPos:changed", { canvas: canvas });
                  canvas.renderAll();

                case "ArrowUp":
                  updateSizeAndPosition(
                    "top",
                    _.round(objSelected.top * canvasRatio - 1)
                  );
                  break;
                case "ArrowDown":
                  updateSizeAndPosition(
                    "top",
                    _.round(objSelected.top * canvasRatio + 1)
                  );
                  break;
                case "ArrowLeft":
                  updateSizeAndPosition(
                    "left",
                    _.round(objSelected.left * canvasRatio - 1)
                  );
                  break;
                case "ArrowRight":
                  updateSizeAndPosition(
                    "left",
                    _.round(objSelected.left * canvasRatio + 1)
                  );
                  break;
                default:
                  break;
              }
            }
          }
        }
      };
    }
  }, [canvas, startDrawing]);

  return { drop };
};

export default useEventHandlers;
