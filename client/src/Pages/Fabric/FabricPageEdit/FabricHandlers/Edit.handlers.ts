import { fabric } from "fabric";
import useUnsavedData from "../../../../hooks/useUnsavedData";
import { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { fabricPageActions } from "../../FabricPageRedAct";
import { createSnapshotOfElement } from "../FabricComponents/CustomElementsHelper";
import {
  loadImageElement,
  loadVideoThumbnail,
  multiMediaObjectFit,
} from "../FabricComponents/MultimediaHelper";
import CustomItemsPicker from "../FabricItemsSchema/CustomItemsPicker";
import {
  convertScreenDimensionPxToCanvasPx,
  convertToFontSize,
  createSplitAreas,
  exportCanvas,
} from "./Toolbar.handlers";
import { useDispatch, useSelector } from "react-redux";
import isEmpty from "lodash/isEmpty";

export const removePolygonMask = () => {
  const drawerElement = document.getElementById("DrawerV2");
  const buttonsInDrawer = drawerElement.querySelectorAll("button");
  drawerElement.style.filter = "none";
  if (drawerElement.firstChild instanceof HTMLElement) {
    drawerElement.firstChild.style.top = 50 + "px";
  }
  buttonsInDrawer.forEach((button) => {
    button.disabled = false; // Adds the disabled property to each button
  });
};

export const applyMask = () => {
  const drawerElement = document.getElementById("DrawerV2");
  const container = document.getElementById("containerCanvasAll");

  if (!container) {
    console.error("containerCanvasAll element not found.");
    return;
  }
  // add filter in elements
  drawerElement.style.filter = "opacity(0.5)";
  if (drawerElement.firstChild instanceof HTMLElement) {
    drawerElement.firstChild.style.top = "0px";
  }
  const buttonsInDrawer = drawerElement.querySelectorAll("button");

  buttonsInDrawer.forEach((button) => {
    button.disabled = true; // Adds the disabled property to each button
  });
};

export const setDimensionsCanvas = (
  newCanvas,
  resolution,
  container,
  orientation
) => {
  const defaultDimensions =
    orientation == "landscape"
      ? { width: 1920, height: 1080 }
      : { width: 430, height: 763 };
  const screenWidth = resolution?.width || defaultDimensions.width;
  const screenHeight = resolution?.height || defaultDimensions.height;
  const aspectRatio = screenWidth / screenHeight;

  const { canvasWidth, canvasHeight } = calculateCanvasDimensions(
    container,
    aspectRatio
  );

  const { multiplier, oldNewCanvasRatio } = calculateMultiplier(
    newCanvas,
    canvasWidth
  );

  resizeCanvas(newCanvas, canvasWidth, canvasHeight);

  adjustViewportTransform(newCanvas, oldNewCanvasRatio, multiplier);
  updateCanvasObjects(
    newCanvas,
    { width: screenWidth, height: screenHeight },
    multiplier
  );
};

const adjustViewportTransform = (newCanvas, oldNewCanvasRatio, multiplier) => {
  if (oldNewCanvasRatio !== 1) {
    const multiplierFixed = oldNewCanvasRatio >= 1 ? 1 : multiplier;
    newCanvas.setViewportTransform([
      multiplierFixed,
      0,
      0,
      multiplierFixed,
      0,
      0,
    ]);
    newCanvas.set("scrollingZoom", 1);
    if (oldNewCanvasRatio > 1) {
      newCanvas.set("viewportZoom", 1);
    } else {
      newCanvas.set("viewportZoom", multiplier);
    }
  }
};

const resizeCanvas = (newCanvas, canvasWidth, canvasHeight) => {
  newCanvas.setDimensions({
    width: canvasWidth,
    height: canvasHeight,
  });
};

const calculateCanvasDimensions = (container, aspectRatio) => {
  const appElement = document.getElementById("app");
  const mainElement = document.querySelector(".App");
  let extraMarginWidth = 0;
  let extraMarginHeight = 0;
  if (appElement.clientWidth > container.clientWidth) {
    extraMarginWidth = 201;
  }
  if (mainElement.clientHeight > container.clientHeight) {
    extraMarginHeight = 40;
  }
  const containerWidth = container.clientWidth + extraMarginWidth - 415;
  const containerHeight = container.clientHeight + extraMarginHeight - 64;

  let canvasWidth, canvasHeight;

  if (containerWidth / containerHeight > aspectRatio) {
    // Adjusting width based on height
    canvasHeight = Math.min(containerHeight, containerHeight);
    canvasWidth = Math.min(canvasHeight * aspectRatio, containerWidth);
  } else {
    // Adjusting height based on width
    canvasWidth = Math.min(containerWidth, containerWidth);
    canvasHeight = Math.min(canvasWidth / aspectRatio, containerHeight);
  }

  return { canvasWidth, canvasHeight };
};

const calculateMultiplier = (newCanvas, canvasWidth) => {
  const oldNewCanvasRatio = canvasWidth / newCanvas.width;
  let multiplier;
  if (oldNewCanvasRatio && Math.abs(oldNewCanvasRatio - 1) < 0.05) {
    if (newCanvas.viewportZoom < 1)
      multiplier = oldNewCanvasRatio * newCanvas.viewportZoom;
    else multiplier = 1;
  } else if (oldNewCanvasRatio < 1) {
    multiplier = oldNewCanvasRatio * newCanvas.viewportZoom;
  } else if (oldNewCanvasRatio > 1) {
    multiplier = oldNewCanvasRatio * newCanvas.viewportZoom;
  }

  let initialCanvas = newCanvas.width === 300 && newCanvas.height === 150;
  if (initialCanvas) multiplier = 1;

  return { multiplier, oldNewCanvasRatio };
};

const updateCanvasObjects = (newCanvas, screenRes, multiplier) => {
  const objects = newCanvas.getObjects();
  const areaObjects = objects.filter((obj) => obj.type === "addMediaArea");
  if (areaObjects.length > 0) {
    const layoutIndex = areaObjects[0].layoutIndex;
    areaObjects.forEach((area) => newCanvas.remove(area));
    const elementsToDelete = document.querySelectorAll(`[data-name="delete"]`);
    elementsToDelete.forEach((elementToDelete) =>
      document.body.removeChild(elementToDelete)
    );
    createSplitAreas(layoutIndex, newCanvas);
  }
  /*check multiplier if >1 meaning,
  the initial window is smaller that the max.
   So everytime you initialize it as long as the next window is larger than before.
  */
  const multFactor = multiplier > 1 ? multiplier : 1;

  //Update all other objects' position and size on canvas resize.
  const allOtherObjs = objects.filter(
    (otherObjs) =>
      otherObjs.type !== "addMediaArea" &&
      otherObjs.superType !== "customObject"
  );
  for (const obj of allOtherObjs) {
    if (obj.type == "Multimedia") {
      if (obj.path !== "") {
        // Get the objects within the group
        const objects = obj.getObjects();
        const newWidth = obj.width * multFactor;
        const newHeight = obj.height * multFactor;

        const backgroundRect = objects[0];
        const media = objects[1];

        obj.set({
          top: obj.top * multFactor,
          left: obj.left * multFactor,
          width: newWidth,
          height: newHeight,
          scaleX: 1,
          scaleY: 1,
          ZoomX: 1,
          ZoomY: 1,
        });
        backgroundRect.set({
          top: obj.top * multFactor,
          left: obj.left * multFactor,
          width: newWidth,
          height: newHeight,
          scaleX: 1,
          scaleY: 1,
          ZoomX: 1,
          ZoomY: 1,
        });
        if (objects.length > 1 && media.getElement().localName == "img") {
          multiMediaObjectFit(
            newCanvas,
            backgroundRect,
            media,
            media.objectFit
          );
        }
        obj.setCoords();
      }
    } else {
      obj.set({
        width: obj.width * multFactor,
        height: obj.height * multFactor,
        top: obj.top * multFactor,
        left: obj.left * multFactor,
      });
      if (obj.type == "IText") {
        obj.set({ fontSize: obj.fontSize * multFactor });
      }
      obj.setCoords();
    }
  }
  //Update customObjects position and size on canvas resizing.
  const customObjs = objects.filter((co) => co.superType == "customObject");
  if (customObjs.length > 0) {
    for (const co of customObjs) {
      const objSettings = {
        ...co,
        ...co.settings,
        size: {
          width: co.width * multFactor,
          height: co.height * multFactor,
        },
      };

      co.set({
        width: co.width * multFactor,
        height: co.height * multFactor,
        top: co.top * multFactor,
        left: co.left * multFactor,
      });

      const element = CustomItemsPicker({
        canvasDimension: {
          width: newCanvas.width / newCanvas.viewportZoom,
          height: newCanvas.height / newCanvas.viewportZoom,
        },
        screenDimension: screenRes,
        type: co.type,
        ...objSettings,
      });
      createSnapshotOfElement(element, co, newCanvas, co.type);
    }
  }
};

const inverseTransformValue = (input) => {
  if (input.match(/^deviceDetail\.\w+$/)) {
    // Matches "deviceDetail.someValue"
    return input.replace(/^deviceDetail\.(\w+)$/, "Detail:$1");
  } else if (input.match(/^deviceDetail\[\d+\]\.Value$/)) {
    // Matches "deviceDetail[3].Value"
    return input.replace(/^deviceDetail\[(\d+)\]\.Value$/, "Detail-$1:Value");
  } else if (input.match(/^deviceDetail\[\d+\]\.Label$/)) {
    // Matches "deviceDetail[3].Label"
    return input.replace(/^deviceDetail\[(\d+)\]\.Label$/, "Detail-$1:Label");
  } else {
    // No match found, return the input as is
    return input;
  }
};
export const designToCanvas2 = async (configuration, canvas) => {
  if (configuration) {
    for (const object of configuration.objects) {
      let element = null;
      let deleteControl, controls;

      let convertedObj = convertScreenDimensionPxToCanvasPx(
        object,
        configuration.resolution,
        {
          width: canvas.width / canvas.viewportZoom,
          height: canvas.height / canvas.viewportZoom,
        }
      );
      switch (convertedObj.type) {
        case "IText":
          const fontSizeUpdated = convertToFontSize(
            { width: canvas.width, height: canvas.height },
            configuration.resolution,
            convertedObj.settings.fontSize,
            false
          );
          convertedObj.settings = {
            ...convertedObj.settings,
            fontSize: fontSizeUpdated,
          };

          // Pre-transform the content array for dynamic texts
          convertedObj.settings.content = convertedObj.settings.content.map(
            (item) => {
              if (item.type === "dynamic") {
                return {
                  ...item,
                  text: inverseTransformValue(item.text), // Transform the text
                };
              }
              return item; // Leave static text unchanged
            }
          );

          // Construct the complete text for the Textbox
          let text = convertedObj.settings.content.reduce(
            (acc, value) => acc + value.text,
            ""
          );

          const iText = new fabric.Textbox(text, {
            ...convertedObj,
            ...convertedObj.settings,
          });

          const iTextStyles = convertedObj.settings.content;

          const applyTextStyle = (iText, start, end, style) => {
            iText.setSelectionStart(start);
            iText.setSelectionEnd(end);
            iText.setSelectionStyles(style);
          };

          let selectorIndex;
          for (let i = 0; i < iTextStyles.length; i++) {
            const currentStyle = iTextStyles[i].style;
            const currentType = iTextStyles[i].type;
            let style = {};
            if (!isEmpty(currentStyle) && !currentType) {
              style = {
                fill: currentStyle.color,
                ...currentStyle,
              };
            } else if (currentType && !isEmpty(currentStyle)) {
              style = {
                fill: currentStyle.color,
                ...currentStyle,
                type: currentType,
                textBackgroundColor: "#CDD0D6",
              };
            } else if (currentType && isEmpty(currentStyle)) {
              style = {
                type: currentType,
                textBackgroundColor: "#CDD0D6",
              };
            }
            if (i == 0) {
              selectorIndex = iTextStyles[0].text.length;
              applyTextStyle(iText, 0, selectorIndex, style);
            } else {
              let start = selectorIndex;
              let end = iTextStyles[i].text.length;
              applyTextStyle(iText, start, start + end, style);
              selectorIndex = start + iTextStyles[i].text.length;
            }
          }

          // Add the iText convertedObj to the canvas
          ({ deleteControl, ...controls } = iText.controls);
          iText.controls = controls;
          canvas.add(iText);
          break;

        case "Line":
          let x1;
          let y1;
          let x2;
          let y2;
          if (convertedObj.startingPoint == "topLeft") {
            x1 = -convertedObj.width / 2;
            y1 = -convertedObj.height / 2;
            x2 = convertedObj.width / 2;
            y2 = convertedObj.height / 2;
          } else {
            x1 = -convertedObj.width / 2;
            y1 = convertedObj.height / 2;
            x2 = convertedObj.width / 2;
            y2 = -convertedObj.height / 2;
          }
          const line = new fabric.Line([x1, y1, x2, y2], convertedObj);
          ({ deleteControl, ...controls } = line.controls);
          line.controls = controls;
          canvas.add(line);
          break;

        case "Weather":
        case "RSSFeed":
        case "Button":
        case "Embed":
        case "QRCode":
          if (convertedObj.type == "Button") {
            convertedObj.triggers = convertedObj.triggers.map((item) => ({
              type: item.type,
              action: item.actions[0].type,
              referenceId: item.actions[0].referenceId,
            }));
          } else if (convertedObj.type == "Embed") {
            convertedObj.settings = {
              ...convertedObj.settings,
              embedLink: convertedObj.settings.link,
            };
          } else if (convertedObj.type == "QRCode") {
            const initialState = {
              typeText: "",
              staticText: "",
              dynamicValue: "",
              numberValue: "",
              stringValue: "",
              showRadioGroup: false,
              selectedRadioOption: "",
            };
            const { currentHeight, currentWidth, ...settings } =
              convertedObj.settings;
            if (settings.typeText === "static") {
              const updatedState = {
                ...initialState,
                staticText: settings.text,
                typeText: settings.typeText,
              };
              convertedObj.settings = {
                ...convertedObj.settings,
                ...updatedState,
              };
            } else {
              let updatedState = {
                ...initialState,
              };
              updatedState.typeText = settings.typeText;
              let textArray = settings.text.split(/[:\-]/);
              if (textArray.length === 1) {
                updatedState.dynamicValue = textArray[0];
              } else if (textArray.length === 2) {
                updatedState.dynamicValue = "DeviceDetail";
                updatedState.stringValue = textArray[1];
              } else {
                updatedState.dynamicValue = "DeviceDetail";
                updatedState.numberValue = textArray[1];
                updatedState.selectedRadioOption = textArray[2];
                updatedState.showRadioGroup = true;
              }
              convertedObj.settings = {
                ...convertedObj.settings,
                ...updatedState,
              };
            }
          }
          element = CustomItemsPicker({
            canvasDimension: {
              width: canvas.width / canvas.viewportZoom,
              height: canvas.height / canvas.viewportZoom,
            },
            screenDimension: configuration.resolution,
            ...convertedObj,
            type: convertedObj.type,
            size: {
              width: convertedObj.width,
              height: convertedObj.height,
            },
            ...convertedObj.settings,
          });
          await createSnapshotOfElement(
            element,
            convertedObj,
            canvas,
            convertedObj.type
          );
          break;
        case "Triangle":
          const triangle = new fabric.Triangle(convertedObj);
          ({ deleteControl, ...controls } = triangle.controls);
          triangle.controls = controls;
          canvas.add(triangle);
          break;

        case "Rect":
          const rectangle = new fabric.Rect(convertedObj);
          ({ deleteControl, ...controls } = rectangle.controls);
          rectangle.controls = controls;
          canvas.add(rectangle);
          break;
        case "Ellipse":
          const ellipse = new fabric.Ellipse({
            ...convertedObj,
            rx: convertedObj.width / 2,
            ry: convertedObj.height / 2,
          });
          ({ deleteControl, ...controls } = ellipse.controls);
          ellipse.controls = controls;

          canvas.add(ellipse);
          break;

        // Add support for other object types as needed

        default:
          console.warn("Unknown object type: " + convertedObj.type);
          break;
      }
    }
    return canvas;
  }
};

// export const designToCanvas = async (
//   configuration,
//   canvas,
//   sasObject,
//   addPlaylist
// ) => {
//   if (configuration) {
//     for (const object of configuration.objects) {
//       let element = null;
//       let deleteControl, controls;

//       let convertedObj = convertScreenDimensionPxToCanvasPx(
//         object,
//         configuration.resolution,
//         {
//           width: canvas.width / canvas.viewportZoom,
//           height: canvas.height / canvas.viewportZoom,
//         }
//       );
//       switch (convertedObj.type) {
//         case "IText":
//           const fontSizeUpdated = convertToFontSize(
//             { width: canvas.width, height: canvas.height },
//             configuration.resolution,
//             convertedObj.settings.fontSize,
//             false
//           );
//           convertedObj.settings = {
//             ...convertedObj.settings,
//             fontSize: fontSizeUpdated,
//           };

//           // Pre-transform the content array for dynamic texts
//           convertedObj.settings.content = convertedObj.settings.content.map(
//             (item) => {
//               if (item.type === "dynamic") {
//                 return {
//                   ...item,
//                   text: inverseTransformValue(item.text), // Transform the text
//                 };
//               }
//               return item; // Leave static text unchanged
//             }
//           );

//           // Construct the complete text for the Textbox
//           let text = convertedObj.settings.content.reduce(
//             (acc, value) => acc + value.text,
//             ""
//           );

//           const iText = new fabric.Textbox(text, {
//             ...convertedObj,
//             ...convertedObj.settings,
//           });

//           const iTextStyles = convertedObj.settings.content;

//           const applyTextStyle = (iText, start, end, style) => {
//             iText.setSelectionStart(start);
//             iText.setSelectionEnd(end);
//             iText.setSelectionStyles(style);
//           };

//           let selectorIndex;
//           for (let i = 0; i < iTextStyles.length; i++) {
//             const currentStyle = iTextStyles[i].style;
//             const currentType = iTextStyles[i].type;
//             let style = {};
//             if (!isEmpty(currentStyle) && !currentType) {
//               style = {
//                 fill: currentStyle.color,
//                 ...currentStyle,
//               };
//             } else if (currentType && !isEmpty(currentStyle)) {
//               style = {
//                 fill: currentStyle.color,
//                 ...currentStyle,
//                 type: currentType,
//                 textBackgroundColor: "#CDD0D6",
//               };
//             } else if (currentType && isEmpty(currentStyle)) {
//               style = {
//                 type: currentType,
//                 textBackgroundColor: "#CDD0D6",
//               };
//             }
//             if (i == 0) {
//               selectorIndex = iTextStyles[0].text.length;
//               applyTextStyle(iText, 0, selectorIndex, style);
//             } else {
//               let start = selectorIndex;
//               let end = iTextStyles[i].text.length;
//               applyTextStyle(iText, start, start + end, style);
//               selectorIndex = start + iTextStyles[i].text.length;
//             }
//           }

//           // Add the iText convertedObj to the canvas
//           ({ deleteControl, ...controls } = iText.controls);
//           iText.controls = controls;
//           canvas.add(iText);
//           break;

//         case "Line":
//           let x1;
//           let y1;
//           let x2;
//           let y2;
//           if (convertedObj.startingPoint == "topLeft") {
//             x1 = -convertedObj.width / 2;
//             y1 = -convertedObj.height / 2;
//             x2 = convertedObj.width / 2;
//             y2 = convertedObj.height / 2;
//           } else {
//             x1 = -convertedObj.width / 2;
//             y1 = convertedObj.height / 2;
//             x2 = convertedObj.width / 2;
//             y2 = -convertedObj.height / 2;
//           }
//           const line = new fabric.Line([x1, y1, x2, y2], convertedObj);
//           ({ deleteControl, ...controls } = line.controls);
//           line.controls = controls;
//           canvas.add(line);
//           break;

//         case "Multimedia":
//           if (["video", "image"].includes(convertedObj.settings.mediaType)) {
//             const libraryFilePath = LibraryFilePath.createByPathWithContainer(
//               convertedObj.settings.path
//             );
//             //create url
//             const filePath = libraryFilePath.getPath();
//             const srcUrl = constructSrcURL({ path: filePath }, sasObject);

//             let indexOfConfiguration = configuration.objects.findIndex(
//               (config) => config == convertedObj
//             );
//             if (convertedObj.settings.mediaType == "video") {
//               await loadVideoThumbnail(
//                 srcUrl,
//                 convertedObj,
//                 convertedObj.settings.objectFit,
//                 indexOfConfiguration,
//                 canvas
//               );
//             } else {
//               await loadImageElement(
//                 srcUrl,
//                 convertedObj,
//                 convertedObj.settings.objectFit,
//                 indexOfConfiguration,
//                 canvas
//               );
//             }
//           } else {
//             addPlaylist({ ID: convertedObj.settings.path }, convertedObj);
//           }

//           break;
//         case "Weather":
//         case "RSSFeed":
//         case "Button":
//         case "Embed":
//         case "QRCode":
//           if (convertedObj.type == "Button") {
//             convertedObj.triggers = convertedObj.triggers.map((item) => ({
//               type: item.type,
//               action: item.actions[0].type,
//               referenceId: item.actions[0].referenceId,
//             }));
//           } else if (convertedObj.type == "Embed") {
//             convertedObj.settings = {
//               ...convertedObj.settings,
//               embedLink: convertedObj.settings.link,
//             };
//           } else if (convertedObj.type == "QRCode") {
//             const initialState = {
//               typeText: "",
//               staticText: "",
//               dynamicValue: "",
//               numberValue: "",
//               stringValue: "",
//               showRadioGroup: false,
//               selectedRadioOption: "",
//             };
//             const { currentHeight, currentWidth, ...settings } =
//               convertedObj.settings;
//             if (settings.typeText === "static") {
//               const updatedState = {
//                 ...initialState,
//                 staticText: settings.text,
//                 typeText: settings.typeText,
//               };
//               convertedObj.settings = {
//                 ...convertedObj.settings,
//                 ...updatedState,
//               };
//             } else {
//               let updatedState = {
//                 ...initialState,
//               };
//               updatedState.typeText = settings.typeText;
//               let textArray = settings.text.split(/[:\-]/);
//               if (textArray.length === 1) {
//                 updatedState.dynamicValue = textArray[0];
//               } else if (textArray.length === 2) {
//                 updatedState.dynamicValue = "DeviceDetail";
//                 updatedState.stringValue = textArray[1];
//               } else {
//                 updatedState.dynamicValue = "DeviceDetail";
//                 updatedState.numberValue = textArray[1];
//                 updatedState.selectedRadioOption = textArray[2];
//                 updatedState.showRadioGroup = true;
//               }
//               convertedObj.settings = {
//                 ...convertedObj.settings,
//                 ...updatedState,
//               };
//             }
//           }
//           element = CustomItemsPicker({
//             canvasDimension: {
//               width: canvas.width / canvas.viewportZoom,
//               height: canvas.height / canvas.viewportZoom,
//             },
//             screenDimension: configuration.resolution,
//             ...convertedObj,
//             type: convertedObj.type,
//             size: {
//               width: convertedObj.width,
//               height: convertedObj.height,
//             },
//             ...convertedObj.settings,
//           });
//           await createSnapshotOfElement(
//             element,
//             convertedObj,
//             canvas,
//             convertedObj.type
//           );
//           break;
//         case "Triangle":
//           const triangle = new fabric.Triangle(convertedObj);
//           ({ deleteControl, ...controls } = triangle.controls);
//           triangle.controls = controls;
//           canvas.add(triangle);
//           break;

//         case "Rect":
//           const rectangle = new fabric.Rect(convertedObj);
//           ({ deleteControl, ...controls } = rectangle.controls);
//           rectangle.controls = controls;
//           canvas.add(rectangle);
//           break;
//         case "Ellipse":
//           const ellipse = new fabric.Ellipse({
//             ...convertedObj,
//             rx: convertedObj.width / 2,
//             ry: convertedObj.height / 2,
//           });
//           ({ deleteControl, ...controls } = ellipse.controls);
//           ellipse.controls = controls;

//           canvas.add(ellipse);
//           break;

//         // Add support for other object types as needed

//         default:
//           console.warn("Unknown object type: " + convertedObj.type);
//           break;
//       }
//     }
//     return canvas;
//   }
// };

const useEditHandlers = ({ initialDesign, screenIndex, setScreenIndex }) => {
  const dispatch = useDispatch();
  const [canvas, setCanvas] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [cursorState, setCursorState] = useState("pointer");
  const [firstTimeLoading, setFirstTimeLoading] = useState(true);
  const canvasRef = useRef(null);
  const designatedAreaRef = useRef(null);
  const resizeTimeoutRef = useRef(null);
  const designs = useSelector((state: any) => state.fabricPageReducer.designs);

  const { unsavedData: selectedDesign, setUnsavedData: setSelectedDesign } =
    useUnsavedData(initialDesign);

  // Sync selectedDesign with Redux when designs change
  useEffect(() => {
    if (selectedDesign) {
      const updatedDesign = designs.find((d) => d.ID === selectedDesign.ID);
      if (
        updatedDesign &&
        JSON.stringify(updatedDesign) !== JSON.stringify(selectedDesign)
      ) {
        setSelectedDesign(updatedDesign);
      }
    }
  }, [designs]);

  const handleStartDrawing = (value, element) => {
    dispatch(fabricPageActions.setStartDrawing({ value, element }));
    applyMask();
  };

  useEffect(() => {
    let newCanvas = null;
    if (screenIndex == -1) {
      setScreenIndex(0);
      return;
    }

    if (canvas) {
      // Remove all old objects from previous screen
      const objs = canvas.getObjects();
      objs.forEach((obj) => {
        canvas.remove(obj);
      });

      newCanvas = canvas;
      // Set background color and ensure it's rendered
      const bgColor =
        selectedDesign.Configuration.screens[screenIndex].background;
      canvas.setBackgroundColor(bgColor);
      canvas.renderAll();
    } else {
      const bgColor =
        selectedDesign.Configuration.screens[screenIndex].background;
      newCanvas = new fabric.Canvas(canvasRef.current, {
        backgroundColor: bgColor,
        fireRightClick: true,
        preserveObjectStacking: true,
        uniformScaling: false,
        selectionFullyContained: true,
        scrollingZoom: 1,
        viewportZoom: 1,
        selectionKey: "ctrlKey",
      });
      setCanvas(newCanvas);
    }
    if (firstTimeLoading) {
      setFirstTimeLoading(false);
    }
    const container = designatedAreaRef.current;

    setDimensionsCanvas(
      newCanvas,
      selectedDesign.Configuration.screens[screenIndex].resolution,
      container,
      selectedDesign.Configuration.screens[screenIndex].orientation
    );
    // Resize canvas when container size changes
    const resizeCanvas = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current); // Clear the previous timeout if it exists
      }
      resizeTimeoutRef.current = setTimeout(() => {
        console.log("resizeee");
        const container = designatedAreaRef.current;

        setDimensionsCanvas(
          newCanvas,
          selectedDesign.Configuration.screens[screenIndex].resolution,
          container,
          selectedDesign.Configuration.screens[screenIndex].orientation
        );
      }, 1300); // Adjust the debounce time as needed
    };

    window.addEventListener("resize", resizeCanvas);

    if (canvas) {
      // Load design objects after setting background
      designToCanvas2(
        selectedDesign.Configuration.screens[screenIndex],
        canvas
      );
      canvas.renderAll();
    }
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current); // Clear the timeout on unmount
      }
    };
  }, [screenIndex, selectedDesign?.ID]);

  // // TODO merge with useEffect above?
  // useEffect(() => {
  //   if (canvas) {
  //     designToCanvas(
  //       selectedDesign.Configuration.screens[screenIndex],
  //       canvas,
  //       sasObject,
  //       addPlaylist
  //     ).then((resolve) => {
  //       canvas.discardActiveObject();
  //       resolve.clone((cloned) => {
  //         setLoadingCanvas(false);
  //       });
  //     });
  //   }
  // }, [canvas]);

  const addNewScreenToDesign = () => {
    const newScreens = [...selectedDesign.Configuration.screens]; // Create a copy of the screens array
    const newObject = {
      id: uuid(),
      name: `Screen-${newScreens.length + 1}`,
      objects: [],
      previewImageUrl:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=",
      background: "#FFFFFF",
      orientation:
        selectedDesign.Configuration.screens[screenIndex].orientation,
      resolution: selectedDesign.Configuration.screens[screenIndex].resolution,
      default: false,
      onIdleReturn: {
        id: "",
        time: "",
      },
    };

    newScreens.push(newObject); // Add the new object to the newScreens array

    setSelectedDesign((prevState) => ({
      ...prevState,
      Configuration: {
        ...prevState.Configuration,
        screens: newScreens,
      },
    }));
  };

  const renderNewScreen = async (screenIndex) => {
    // Remove all old objects from previous screen
    const objs = canvas.getObjects();
    objs.forEach((obj) => {
      canvas.remove(obj);
    });

    canvas.setBackgroundColor(
      selectedDesign.Configuration.screens[screenIndex].background
    );

    canvas.renderAll();
  };

  const changeDesignScreen = async (value) => {
    const tempScreenConfig = exportCanvas(canvas, selectedDesign, screenIndex);
    const designScreens = [...selectedDesign.Configuration.screens]; // Create a copy of the screens array
    let newScreens = designScreens.map((screen, i) => {
      if (i == screenIndex) {
        return tempScreenConfig;
      } else return screen;
    });
    const existingDivs = document.querySelectorAll("#extraSpace");
    const editPageDiv = document.querySelector(".editPage");
    existingDivs.forEach((child) => editPageDiv.removeChild(child));

    await renderNewScreen(value);

    setSelectedDesign((prevState) => ({
      ...prevState,
      Configuration: {
        ...prevState.Configuration,
        screens: newScreens,
      },
    }));
    setScreenIndex(value);
  };

  const zoomTextRef = useRef();
  // Temporary landing area object
  const landingAreaRectRef = useRef(null);

  useEffect(() => {
    const existingDivs = document.querySelectorAll("#extraSpace");
    const container = document.querySelector(".editPage");
    existingDivs.forEach((child) => container.removeChild(child));
  }, [selectedDesign?.ID]);

  return {
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
  };
};

export default useEditHandlers;
