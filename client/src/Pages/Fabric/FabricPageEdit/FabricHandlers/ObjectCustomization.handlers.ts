import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { fabricPageActions } from "../../FabricPageRedAct";
import { multiMediaObjectFit } from "../FabricComponents/MultimediaHelper";
import { updateSelectedDesignState } from "./Options.handlers";
import { convertCanvasPxToScreenDimensionPx } from "./Toolbar.handlers";
import { useAppDispatch } from "../../../../reduxConfig/reduxHooks";
import { removePolygonMask } from "./Edit.handlers";

const useObjectCustomizationHandlers = ({
  canvas,
  setSelectedObject,
  selectedObject,
  setSelectedDesign,
  selectedDesign,
  screenIndex,
}: {
  canvas;
  setSelectedObject?: any;
  selectedObject?: any;
  setSelectedDesign?: any;
  selectedDesign?: any;
  screenIndex?: any;
}) => {
  const dispatch = useAppDispatch();

  const [canvasBgColor, setCanvasBgColor] = useState("");

  const [toggleBtnGroupFont, setToggleBtnGroupFont] = useState({
    fontSize: 32,
    bold: false,
    italic: false,
    underline: false,
  });
  const [pxToPercentage, setPxToPercentage] = useState(false);
  const [objFullscreen, setObjFullscreen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("contain");
  const [objectName, setObjectName] = useState(selectedObject?.name || "");
  const [objectAngle, setObjectAngle] = useState(selectedObject?.angle || "0");
  const [objectColor, setObjectColor] = useState({
    fill: selectedObject?.fill,
    stroke: selectedObject?.stroke,
    fillAlpha: parseInt(selectedObject?.fill?.slice(-2), 16),
    strokeAlpha: parseInt(selectedObject?.stroke?.slice(-2), 16),
  });
  const lastSelectedObject = useRef(selectedObject);

  const convertPxToPercentage = (
    modifiedObj,
    pxToPercentage,
    selectedDesign,
    screenIndex
  ) => {
    if (!selectedObject) {
      return { left: "", top: "", width: "", height: "" };
    }
    if (pxToPercentage) {
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const multiplicationFactorWidth = 100 / canvasWidth;
      const multiplicationFactorHeight = 100 / canvasHeight;
      return {
        left: Math.round(modifiedObj.left * multiplicationFactorWidth),
        top: Math.round(modifiedObj.top * multiplicationFactorHeight),
        width: Math.round(modifiedObj.width * multiplicationFactorWidth),
        height: Math.round(modifiedObj.height * multiplicationFactorHeight),
      };
    } else {
      const canvasZoom = canvas.viewportZoom;
      let convertedObj = selectedDesign
        ? convertCanvasPxToScreenDimensionPx(
            modifiedObj,
            selectedDesign.Configuration.screens[screenIndex].resolution,
            {
              width: canvas.width / canvasZoom,
              height: canvas.height / canvasZoom,
            }
          )
        : modifiedObj;
      return {
        left: convertedObj.left,
        top: convertedObj.top,
        width: convertedObj.width,
        height: convertedObj.height,
      };
    }
  };

  const {
    left: objectLeft,
    top: objectTop,
    width: objectWidth,
    height: objectHeight,
  } = convertPxToPercentage(
    selectedObject,
    pxToPercentage,
    selectedDesign,
    screenIndex
  );

  const checkAllCharactersStyles = (activeObj, start, end) => {
    if (activeObj && activeObj.type === "IText") {
      let allBold = true;
      let allItalic = true;
      let allUnderline = true;
      let allFontSize = true;
      const fontSizesSet = new Set();

      for (let i = start; i < end; i++) {
        const charStyle = activeObj.getSelectionStyles(i, i + 1)[0];
        if (charStyle && charStyle.fontSize) {
          fontSizesSet.add(charStyle.fontSize);
        }
      }
      if (fontSizesSet.size > 1) {
        allFontSize = false;
      }

      for (let i = start; i < end; i++) {
        const charStyle = activeObj.getSelectionStyles(i, i + 1)[0];

        if (!charStyle || charStyle.fontWeight !== "bold") {
          allBold = false;
        }
        if (!charStyle || charStyle.fontStyle !== "italic") {
          allItalic = false;
        }
        if (!charStyle || charStyle.underline !== true) {
          allUnderline = false;
        }

        // If all three styles are already false, no need to continue checking
        if (!allBold && !allItalic && !allUnderline) {
          break;
        }
      }

      return {
        isAllBold: allBold,
        isAllItalic: allItalic,
        isAllUnderline: allUnderline,
        isAllFontSize:
          fontSizesSet.size > 1 ? "" : fontSizesSet.values().next().value,
      };
    }
    return {
      isAllBold: false,
      isAllItalic: false,
      isAllUnderline: false,
      isAllFontSize: "",
    };
  };

  const checkLastCharacterStyle = (activeObj, start) => {
    let cursorPos = start === 0 ? 0 : start - 1;

    let cumulativeLength = 0;
    let line;

    const textLines = activeObj.textLines;
    for (let j = 0; j < textLines.length; j++) {
      if (cursorPos <= textLines[j].length + cumulativeLength) {
        line = j;
        cursorPos = cursorPos - cumulativeLength;
        break;
      }
      cumulativeLength += textLines[j].length + 1;
    }

    let fontWeight, fontStyle, underline, fontSize;
    if (activeObj?.styles[line]) {
      if (Array.isArray(activeObj.styles)) {
        fontWeight = activeObj?.styles[line][cursorPos]?.fontWeight;
        fontStyle = activeObj?.styles[line][cursorPos]?.fontStyle;
        underline = activeObj?.styles[line][cursorPos]?.underline;
        fontSize =
          activeObj?.styles[line][cursorPos]?.fontSize ||
          activeObj?.fontSize ||
          32;
      } else if (
        typeof activeObj.styles === "object" &&
        Object.keys(activeObj.styles).length > 0
      ) {
        fontWeight = activeObj?.styles[line][cursorPos]?.fontWeight;
        fontStyle = activeObj?.styles[line][cursorPos]?.fontStyle;
        underline = activeObj?.styles[line][cursorPos]?.underline;
        fontSize =
          activeObj?.styles[line][cursorPos]?.fontSize ||
          activeObj?.fontSize ||
          32;
      }
    } else {
      fontWeight = "normal";
      fontStyle = "normal";
      underline = false;
    }

    let isBold = fontWeight === "bold";
    let isItalic = fontStyle === "italic";
    let isUnderline = underline;
    if (!isBold && activeObj.fontWeight === "bold") isBold = true;
    if (!isItalic && activeObj.fontStyle === "italic") isItalic = true;
    if (!isUnderline && activeObj.underline) isItalic = true;

    return {
      isAllBold: isBold,
      isAllItalic: isItalic,
      isAllUnderline: isUnderline,
      isAllFontSize: fontSize,
    };
  };
  const setToggleBtnGroupFontFunction = (activeObj, wholeText) => {
    const selectionStart = selectedObject.selectionStart;
    const selectionEnd = selectedObject.selectionEnd;
    const textLength = activeObj.text.length;
    const start = wholeText ? 0 : selectionStart;
    const end = wholeText
      ? textLength
      : activeObj.isEditing
      ? selectionEnd
      : textLength;
    const isEditing = activeObj.isEditing;

    const { isAllBold, isAllItalic, isAllUnderline, isAllFontSize } =
      selectionStart === selectionEnd && isEditing
        ? checkLastCharacterStyle(activeObj, start)
        : checkAllCharactersStyles(activeObj, start, end);

    setToggleBtnGroupFont({
      ...toggleBtnGroupFont,
      bold: isAllBold,
      italic: isAllItalic,
      underline: isAllUnderline,
      fontSize: isAllFontSize,
    });
  };

  useEffect(() => {
    if (canvas) {
      setCanvasBgColor(canvas.backgroundColor);
    }
  }, [canvas]);

  useEffect(() => {
    if (
      lastSelectedObject.current &&
      lastSelectedObject.current.type === "IText" &&
      lastSelectedObject.current.id !== selectedObject?.id
    ) {
      if (typeof lastSelectedObject.current.set === "function") {
        lastSelectedObject.current.set("name", lastSelectedObject.current.text);
      }
    }
    if (selectedObject) {
      lastSelectedObject.current = selectedObject;
      setAngle(selectedObject.angle);
      if (selectedObject.type === "QRCode") {
        const rect = selectedObject._objects[0];
        setObjectColor({
          fill: rect.fill,
          stroke: rect.stroke,
          fillAlpha: parseInt(rect.fill.slice(-2), 16),
          strokeAlpha: rect?.stroke ? parseInt(rect?.stroke.slice(-2), 16) : 0,
        });
      } else if (selectedObject.type !== "Multimedia") {
        setObjectColor({
          fill: selectedObject.fill,
          stroke: selectedObject.stroke,
          fillAlpha: parseInt(selectedObject?.fill?.slice(-2), 16),
          strokeAlpha: selectedObject?.stroke
            ? parseInt(selectedObject?.stroke.slice(-2), 16)
            : 0,
        });
      }
      setObjectName(selectedObject.name);
      if (selectedObject.type === "Multimedia" && selectedObject.path !== "") {
        const activeObj = canvas.getActiveObject();
        if (activeObj?.id === selectedObject.id) {
          const objects = activeObj.getObjects();
          if (objects.length > 1) {
            setAspectRatio(objects[1].objectFit);
          }
        }
      }
      if (
        selectedObject.width < canvas.width &&
        selectedObject.height < canvas.height &&
        selectedObject.top !== 0 &&
        selectedObject.left !== 0
      ) {
        setObjFullscreen(false);
      }
      const activeObj = canvas.getActiveObject();

      if (activeObj && activeObj.type === "IText") {
        setToggleBtnGroupFontFunction(activeObj, true);
        activeObj.on("selection:changed", (e) => {
          setToggleBtnGroupFontFunction(activeObj, false);
        });
      }

      canvas.requestRenderAll();
    }
  }, [selectedObject]);

  const setTextFieldValues = (dimension, value) => {
    updateSizeAndPosition(dimension, value);
  };

  const onBlurTextfield = (dimension) => {
    return;
  };

  const handleObjectFullscreen = (value) => {
    if (value) {
      if (selectedObject.type === "Multimedia" && selectedObject.path !== "") {
        // Get the objects within the group
        const objects = selectedObject.getObjects();

        const backgroundRect = objects[0];
        const media = objects[1];

        selectedObject.set({
          width: canvas.width,
          height: canvas.height,
          left: 0,
          top: 0,
        });
        backgroundRect.set({
          width: canvas.width,
          height: canvas.height,
          left: 0,
          top: 0,
        });
        if (objects.length > 1 && media.getElement().localName === "img") {
          multiMediaObjectFit(canvas, backgroundRect, media, media.objectFit);
        }
      } else {
        selectedObject.set({
          width: canvas.width,
          height: canvas.height,
          left: 0,
          top: 0,
        });
      }
      canvas.renderAll();
    }
    setObjFullscreen(value);
  };

  const handleCanvasColor = (color) => {
    canvas.set({ backgroundColor: color });
    setCanvasBgColor(color);
    updateSelectedDesignState(
      "background",
      color,
      selectedDesign,
      setSelectedDesign,
      screenIndex
    );
    canvas.renderAll();
  };

  const centerObject = (obj, centered) => {
    if (centered) {
      canvas.centerObject(obj);
      obj.setCoords();
    } else {
      setByPartial(obj, {
        left: obj.left,
        top: obj.top,
      });
    }
  };

  const setByPartial = (obj, option) => {
    if (!obj) {
      return;
    }

    obj.set(option);
    obj.setCoords();
    dispatch(fabricPageActions.setStartDrawing({ value: false, element: "" }));
    removePolygonMask();
    canvas.renderAll();
  };

  const getActiveObject = () => {
    const activeObj = canvas.getActiveObject();
    if (activeObj && !activeObj?.isPoint) return activeObj;
    else {
      const objects = canvas.getObjects();
      const anyCircle = objects.find(
        (obj) => obj.type === "circle" || obj.isPoint
      );
      const line = objects.find((obj) => obj.id === anyCircle?.referenceId);
      return line;
    }
  };
  const setFontSize = (size) => {
    const activeObj = canvas.getActiveObject();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const widthRatio =
      selectedDesign.Configuration.screens[screenIndex].resolution.width /
      canvasWidth;
    const heightRatio =
      selectedDesign.Configuration.screens[screenIndex].resolution.height /
      canvasHeight;

    // Use the average of width and height ratios to maintain aspect ratio
    const averageRatio =
      Math.min(widthRatio, heightRatio) * canvas.viewportZoom;

    // Calculate scaled font size
    const scaledFontSize = size / averageRatio;

    const width = activeObj.width;
    const height = activeObj.height;
    if (activeObj && activeObj.type === "IText") {
      if (!activeObj.isEditing) {
        activeObj.setSelectionStyles(
          { fontSize: scaledFontSize },
          0,
          activeObj.text.length
        ); // Update the IText object's whole text with the new fontSize
      } else {
        const selectionStart = activeObj.selectionStart;
        const selectionEnd = activeObj.selectionEnd;
        activeObj.setSelectionStyles(
          { fontSize: scaledFontSize },
          selectionStart,
          selectionEnd
        );
      }
      setSelectedObject((prevObj) => {
        let updatedObj = { fontSize: scaledFontSize, ...prevObj };
        return updatedObj;
      });
      activeObj.set({
        width: width,
        height: height,
      });
      canvas.renderAll();
    }
  };
  const setFontFamily = (family) => {
    const activeObj = canvas.getActiveObject();
    const width = activeObj.width;
    const height = activeObj.height;
    if (activeObj && activeObj.type === "IText") {
      activeObj.set({
        fontFamily: family,
      });
      // Update the IText object with the new dimensions
      activeObj.set({
        width: width,
        height: height,
      });
      canvas.renderAll();
    }
  };
  const setTextAlignment = (alignment) => {
    const activeObj = canvas.getActiveObject();
    const width = activeObj.width;
    const height = activeObj.height;
    if (activeObj && activeObj.type === "IText") {
      activeObj.set({
        textAlign: alignment,
      });
      // Update the IText object with the new dimensions
      activeObj.set({
        width: width,
        height: height,
      });
      canvas.renderAll();
    }
  };

  const setTextStyle = (style, value) => {
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.type === "IText") {
      const selectionStart = activeObj.selectionStart;
      const selectionEnd = activeObj.selectionEnd;
      let styleObject = { [style]: value };
      //Need to calculate scaled font
      if (style === "fontSize") {
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const widthRatio =
          selectedDesign.Configuration.screens[screenIndex].resolution.width /
          canvasWidth;
        const heightRatio =
          selectedDesign.Configuration.screens[screenIndex].resolution.height /
          canvasHeight;

        // Use the average of width and height ratios to maintain aspect ratio
        const averageRatio =
          Math.min(widthRatio, heightRatio) * canvas.viewportZoom;

        // Calculate scaled font size
        const scaledFontSize = value / averageRatio;
        styleObject = { [style]: scaledFontSize };
      }
      if (!activeObj.isEditing) {
        // Apply styles from start to end of the whole text
        activeObj.setSelectionStyles(styleObject, 0, activeObj.text.length);
      } else {
        // Apply styles only to the selected text
        if (selectionStart !== selectionEnd) {
          activeObj.setSelectionStyles(
            styleObject,
            selectionStart,
            selectionEnd
          );
        }
      }

      // Update text objects

      // Update the toggle button group font
      setToggleBtnGroupFontFunction(activeObj, false);

      // Make sure to re-render the canvas to reflect the changes
      canvas.renderAll();
    }
  };

  const setTextColor = (color) => {
    const activeObj = canvas.getActiveObject();
    if (activeObj.type !== "IText") {
      if (
        (activeObj.type === "Multimedia" && activeObj.path !== "") ||
        activeObj.type === "QRCode"
      ) {
        const backgroundRect = activeObj.getObjects()[0];
        backgroundRect.set("fill", color);
        canvas.renderAll();
      } else {
        activeObj.set("fill", color);
        canvas.renderAll();
      }
    } else {
      const selectionStart = activeObj.selectionStart;
      const selectionEnd = activeObj.selectionEnd;

      if (selectionStart === selectionEnd) {
        // activeObj.set("fill", color);
        // activeObj.set("color", color);
      } else {
        activeObj.setSelectionStyles(
          { fill: color, color: color },
          selectionStart,
          selectionEnd
        );
      }
      canvas.renderAll();
    }
  };
  const setBackgroundColor = (color) => {
    const activeObj = getActiveObject();
    if (activeObj) {
      activeObj.set("backgroundColor", color);
      canvas.renderAll();
    }
  };

  const setColorOpacity = (colorArea) => (event, value) => {
    // Convert the slider value to the alpha channel (0 to 255)
    const alpha = Math.round((value / 100) * 255);
    const alphaArea = colorArea === "fill" ? "fillAlpha" : "strokeAlpha";

    // Update the alpha channel in the RGBA hex color
    const updatedRgbaColor =
      selectedObject[colorArea].slice(0, -2) +
      alpha.toString(16).padStart(2, "0");
    const activeObj = getActiveObject();
    if (
      (activeObj.type === "Multimedia" && activeObj.settings.path !== "") ||
      activeObj.superType === "customObject"
    ) {
      const multimediaColor =
        selectedObject._objects[0][colorArea].slice(0, -2) +
        alpha.toString(16).padStart(2, "0");

      const backgroundRect = activeObj.getObjects()[0];
      backgroundRect.set(colorArea, multimediaColor);
      canvas.renderAll();
    } else {
      if (activeObj.type === "IText" && activeObj.isEditing) {
        const startIdx = activeObj.selectionStart;
        const endIdx = activeObj.selectionEnd;
        activeObj.setSelectionStyles(
          { [colorArea]: updatedRgbaColor },
          startIdx,
          endIdx
        );
      } else activeObj.set(colorArea, updatedRgbaColor);
      canvas.renderAll();
    }
    setObjectColor({
      ...objectColor,
      [colorArea]: updatedRgbaColor,
      [alphaArea]: value,
    });
  };
  const setStrokeColor = (color) => {
    const activeObj = getActiveObject();
    if (activeObj.type !== "IText") {
      if (
        (activeObj.type === "Multimedia" && activeObj.settings.path !== "") ||
        activeObj.superType === "customObject"
      ) {
        const backgroundRect = activeObj.getObjects()[0];
        backgroundRect.set("stroke", color);
        canvas.renderAll();
      } else if (activeObj.type === "circle" && activeObj.isPoint) {
        const line = canvas
          .getObjects()
          .find((o) => o.id === activeObj.referenceId && o.type === "Line");
        line.set("stroke", color);
        canvas.renderAll();
      } else {
        activeObj.set("stroke", color);
        canvas.renderAll();
      }
    } else {
      const selectionStart = activeObj.selectionStart;
      const selectionEnd = activeObj.selectionEnd;

      if (selectionStart === selectionEnd) {
        activeObj.set("stroke", color);
      } else {
        activeObj.setSelectionStyles(
          { stroke: color },
          selectionStart,
          selectionEnd
        );
      }
      canvas.renderAll();
    }
  };

  const setOpacity = (value) => {
    const activeObj = getActiveObject();
    if (activeObj) {
      activeObj.set("opacity", value);
      canvas.renderAll();
    }
  };
  const setAngle = (newAngle) => {
    const activeObj = getActiveObject();
    const fixedValue = parseInt(newAngle, 10);
    // Update the angle of the active object
    if (activeObj) {
      activeObj.set("angle", fixedValue);
      setObjectAngle(fixedValue);
      canvas.renderAll();
    }
  };

  const setStrokeWidth = (width) => {
    const parsedWidth = width ? parseInt(width) : 0;
    const activeObj = getActiveObject();
    if (activeObj.type !== "IText") {
      if (
        (activeObj.type === "Multimedia" && activeObj.path !== "") ||
        activeObj.superType === "customObject"
      ) {
        const backgroundRect = activeObj.getObjects()[0];
        backgroundRect.set("strokeWidth", parsedWidth);
        canvas.renderAll();
      } else if (activeObj.type === "circle" && activeObj.isPoint) {
        const line = canvas
          .getObjects()
          .find((o) => o.id === activeObj.referenceId && o.type === "Line");
        line.set("strokeWidth", parsedWidth);
        canvas.renderAll();
      } else {
        activeObj.set("strokeWidth", parsedWidth);
        canvas.renderAll();
      }
    } else {
      const selectionStart = activeObj.selectionStart;
      const selectionEnd = activeObj.selectionEnd;

      if (selectionStart === selectionEnd) {
        activeObj.set("strokeWidth", parsedWidth);
      } else {
        activeObj.setSelectionStyles(
          { strokeWidth: parsedWidth },
          selectionStart,
          selectionEnd
        );
      }
      canvas.renderAll();
    }
  };

  const setRadius = (value) => {
    const activeObj = getActiveObject();
    if (activeObj) {
      activeObj.set({ rx: value, ry: value });
      canvas.renderAll();
    }
  };
  const changeName = (value) => {
    const obj = getActiveObject();
    obj.set("name", value);
    // canvas.renderAll();
    setObjectName(value);
  };
  const updateSizeAndPosition = (key, value) => {
    let obj = getActiveObject();
    if (
      obj &&
      ((obj && obj.id === "pointer-1") || (obj && obj.id === "pointer-2")) &&
      obj.isPoint
    ) {
      const line = canvas
        .getObjects()
        .find((o) => o.id === obj.referenceId && o.type === "Line");
      obj = line;
    }
    // let value;
    // if (key === "left") value = objectLeft;
    // else if (key === "width") value = objectWidth;
    // else if (key === "height") value = objectHeight;
    // else if (key === "top") value = objectTop;

    if (obj) {
      let updatedValue = value;
      if (pxToPercentage) {
        const multiFactor = value / 100;
        if (key === "width" || key === "left") {
          updatedValue = Math.round(canvas.width * multiFactor);
        } else {
          updatedValue = Math.round(canvas.height * multiFactor);
        }
      } else {
        const widthOrHeight =
          key === "width" || key === "left" ? "width" : "height";
        updatedValue =
          (parseInt(value) * canvas[widthOrHeight]) /
          selectedDesign.Configuration.screens[screenIndex].resolution[
            widthOrHeight
          ];
        updatedValue = updatedValue / canvas.viewportZoom;
      }

      if (obj[key] !== updatedValue) {
        // Check if value has changed
        obj.set({ [key]: updatedValue });

        obj.setCoords();
        //tsekarisma sto Line na enhmerwnontai kai ta circle points
        if (obj.type === "Line") {
          let centerX = obj.getCenterPoint().x;
          let centerY = obj.getCenterPoint().y;

          let offset = obj.calcLinePoints();
          const linepoints = canvas
            .getObjects()
            .filter((o) => o.type === "circle" && o.isPoint);
          linepoints.forEach((point) => {
            if (point.id === "pointer-1") {
              point.set({
                left: centerX + offset.x1,
                top: centerY + offset.y1,
              });
            } else {
              point.set({
                left: centerX + offset.x2,
                top: centerY + offset.y2,
              });
            }
          });
        }
        canvas.renderAll();
        if (obj.type === "Multimedia") {
          canvas.fire("object:scaling", { target: obj, action: "noLines" });
          canvas.fire("object:modified", { target: obj, action: "scale" });
        } else {
          canvas.fire("object:modified", { target: obj, action: "scale" });
        }
      }
    }
  };

  const updateObjectModification = (
    modifiedObject,
    pxToPercentage,
    selectedDesign,
    screenIndex
  ) => {
    if (modifiedObject.isMoving === true) {
      modifiedObject.setCoords();
      modifiedObject.set({
        left: Math.round(modifiedObject.left),
        top: Math.round(modifiedObject.top),
        width: Math.round(modifiedObject.width),
        height: Math.round(modifiedObject.height),
      });
      if (
        modifiedObject.id === "pointer-1" ||
        modifiedObject.id === "pointer-2"
      ) {
        const line = canvas
          .getObjects()
          .find((o) => o.id === modifiedObject.referenceId);
        setSelectedObject(line);
      } else setSelectedObject({ ...modifiedObject });
      // convertPxToPercentage(
      //   modifiedObject,
      //   pxToPercentage,
      //   selectedDesign,
      //   screenIndex,
      //   true
      // );
      canvas.renderAll();
    } else if (modifiedObject.__corner !== false) {
      const newWidth = modifiedObject.width * modifiedObject.scaleX;
      const newHeight = modifiedObject.height * modifiedObject.scaleY;
      modifiedObject.set({
        width: newWidth,
        height: newHeight,
        scaleX: 1,
        scaleY: 1,
        ZoomX: 1,
        ZoomY: 1,
      });
      modifiedObject.setCoords();
      modifiedObject.set({
        left: modifiedObject.left,
        top: modifiedObject.top,
      });
      setSelectedObject({ ...modifiedObject });
      // convertPxToPercentage(
      //   modifiedObject,
      //   pxToPercentage,
      //   selectedDesign,
      //   screenIndex,
      //   true
      // );
      if (
        modifiedObject.width < canvas.width &&
        modifiedObject.height < canvas.height &&
        modifiedObject.top !== 0 &&
        modifiedObject.left !== 0
      ) {
        setObjFullscreen(false);
      }
      canvas.renderAll();
    }
  };

  const findDynamicRanges = (activeTextObj, line) => {
    const characters = activeTextObj.text.split("");
    const dynamicRanges = [];
    let dynamicRangeStart = -1;
    let dynamicRangeEnd = -1;
    const textStyles = activeTextObj.styles[line];

    // Iterate over each character
    for (let i = 0; i < characters.length; i++) {
      const charIndex = i.toString();

      // Check if the character's style has a "type" property set to "dynamic"
      if (
        textStyles &&
        textStyles[charIndex] &&
        textStyles[charIndex].type === "dynamic"
      ) {
        // If we are not currently tracking a dynamic range, set the start index
        if (dynamicRangeStart === -1) {
          dynamicRangeStart = i;
        }
        // Update the end index with each iteration to capture the last matching character
        dynamicRangeEnd = i;
      } else {
        // If we were tracking a dynamic range, add it to the result array
        if (dynamicRangeStart !== -1 && dynamicRangeEnd !== -1) {
          dynamicRanges.push({
            start: dynamicRangeStart,
            end: dynamicRangeEnd,
          });
          dynamicRangeStart = -1;
          dynamicRangeEnd = -1;
        }
      }
    }

    // If there is a remaining dynamic range at the end of the text, add it to the result array
    if (dynamicRangeStart !== -1 && dynamicRangeEnd !== -1) {
      dynamicRanges.push({ start: dynamicRangeStart, end: dynamicRangeEnd });
    }

    return dynamicRanges;
  };

  const addDynamicText = (value, afterDelOrAdd, cursorPosDelete) => {
    const activeObject = canvas.getActiveObject(); // Assuming you have a reference to the active IText object
    // Define the words we want to style
    const wordsToStyle = [
      // "DeviceName",
      "DeviceDescription",
      "DeviceCode",
      // "BranchName",
      "BranchDeviceDetails",
      "BranchCode",
      "ButlerPrice",
      "Price",
      "StorePrice",
      "Detail-\\d+:Value",
      "Detail-\\d+:Label",
      "Detail:\\w+",
    ];
    const patternsToTest = wordsToStyle.map((word) => new RegExp(`^${word}$`)); // Convert each word to a RegExp object
    let isOneOfWords = false;
    for (const pattern of patternsToTest) {
      if (pattern.test(value)) {
        isOneOfWords = true;
        break;
      }
    }

    if (activeObject && activeObject.type === "IText") {
      const cursorPosition = activeObject.selectionStart; // Get the current cursor position
      const addedText = isOneOfWords ? " " + value + " " : value;
      const currentText = activeObject.text;
      const firstPart = currentText.slice(0, cursorPosition);
      const secondPart = currentText.slice(cursorPosition);

      // Combine the first part, inserted text, and second part together
      const newText = firstPart + addedText + secondPart;

      // Update the text content of the active object
      activeObject.set("text", newText);
      canvas.renderAll();

      if (cursorPosDelete !== undefined && afterDelOrAdd === "delete") {
        activeObject.setSelectionStart(cursorPosDelete);
        activeObject.setSelectionEnd(cursorPosDelete);
      } else {
        activeObject.setSelectionStart(cursorPosition + addedText.length);
        activeObject.setSelectionEnd(cursorPosition + addedText.length);
      }
      activeObject.exitEditing();
      // Wait for a short delay
      setTimeout(function () {
        // Re-enter editing mode after the delay
        activeObject.enterEditing();

        // Render the canvas
        canvas.renderAll();
      }, 200); // Adjust the delay as needed
    }
  };

  const handleChangeAspectRatio = (value) => {
    setAspectRatio(value);
    const objects = selectedObject.getObjects();
    const backgroundRect = objects[0];
    const media = objects[1];
    if (value === "fill") media.set("objectFit", "fill");
    else if (value === "contain") media.set("objectFit", "contain");
    else media.set("objectFit", "cover");
    if (media.getElement().localName === "img") {
      multiMediaObjectFit(canvas, backgroundRect, media, value);
      canvas.renderAll();
    }
  };

  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenPopover = (comp, min, max) => (event) => {
    setAnchorEl({
      anchor: event.currentTarget,
      component: comp,
      min: min,
      max: max,
    });
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  return {
    setCanvasBgColor,
    canvasBgColor,
    centerObject,
    setFontSize,
    setFontFamily,
    setTextAlignment,
    setTextStyle,
    setTextColor,
    setBackgroundColor,
    setStrokeColor,
    setOpacity,
    setAngle,
    setColorOpacity,
    setStrokeWidth,
    setRadius,
    handleCanvasColor,
    updateObjectModification,
    updateSizeAndPosition,
    objectHeight,
    objectLeft,
    objectTop,
    objectWidth,
    setTextFieldValues,
    onBlurTextfield,
    objectAngle,
    objectColor,
    addDynamicText,
    objectName,
    changeName,
    aspectRatio,
    handleChangeAspectRatio,
    findDynamicRanges,
    handleObjectFullscreen,
    objFullscreen,
    setPxToPercentage,
    pxToPercentage,
    anchorEl,
    handleClosePopover,
    handleOpenPopover,
    toggleBtnGroupFont,
  };
};

export default useObjectCustomizationHandlers;
