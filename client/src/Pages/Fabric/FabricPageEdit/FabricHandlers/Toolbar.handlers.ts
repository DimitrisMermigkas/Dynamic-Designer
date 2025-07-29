import { useState } from "react";
import { fabric } from "fabric";
import FabricItemOptions from "../FabricItemsSchema/FabricItemsSchema";
import { createSnapshotOfElement } from "../FabricComponents/CustomElementsHelper";
import CustomItemsPicker from "../FabricItemsSchema/CustomItemsPicker";
import { fabricPageActions } from "../../FabricPageRedAct";
import useDrawingHandlers from "./oldLinehandler";
import { useDispatch } from "react-redux";

const createDeleteIconImage = (value) => {
  let deleteIcon =
    "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";
  let img = document.createElement("img");
  img.src = deleteIcon;
  img.width = 24;
  img.setAttribute("data-name", value);
  img.setAttribute("data-control", "delete");
  return img;
};
export const initializeShapes = (element, handleStartDrawing, dispatch) => {
  if (element === "Line") {
    handleStartDrawing(true, "Line");
    dispatch(fabricPageActions.setActiveLine(null));
    dispatch(fabricPageActions.setPointArray([]));
  } else if (element === "polygon") {
    handleStartDrawing(true, "polygon");
    dispatch(fabricPageActions.setActiveLine(null));
    dispatch(fabricPageActions.setActiveShape(null));
    dispatch(fabricPageActions.setPointArray([]));
    dispatch(fabricPageActions.setLineArray([]));
  }
};
const transformValue = (input) => {
  if (input.match(/^Detail:\w+$/)) {
    // Matches "Detail:\w+" pattern
    return input.replace(/^Detail:(\w+)$/, "deviceDetail.$1");
  } else if (input.match(/^Detail-\d+:Value$/)) {
    // Matches "Detail-\d+:Value" pattern
    return input.replace(/^Detail-(\d+):Value$/, "deviceDetail[$1].Value");
  } else if (input.match(/^Detail-\d+:Label$/)) {
    // Matches "Detail-\d+:Label" pattern
    return input.replace(/^Detail-(\d+):Label$/, "deviceDetail[$1].Label");
  } else {
    // No match found, return the input as is
    return input;
  }
};
const convertTriggersToSchema = (dataArray = []) => {
  const updatedDataArray = dataArray.map((item) => {
    const object = {
      type: item.type,
      actions: [{ type: item.action, referenceId: item.referenceId }],
      properties: null,
    };
    return object;
  });
  return updatedDataArray;
};

const createContentArray = (
  text,
  styles,
  canvasDimension,
  screenDimension,
  toDesign
) => {
  const content = [];

  let currentPosition = 0;
  const indexMapping = [];

  // Create mapping from logical index (ignoring \n) to actual index
  let logicalIndex = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== "\n") {
      indexMapping[logicalIndex] = i;
      logicalIndex++;
    }
  }

  // Adjusted function to map logical positions to actual indexes
  for (const style of styles) {
    const { start, end, style: textStyle } = style;
    const { type, ...restTextStyle } = textStyle;

    // find the font size of the text style
    const convertedFontSize = convertToFontSize(
      canvasDimension,
      screenDimension,
      textStyle.fontSize,
      toDesign
    );
    restTextStyle.fontSize = convertedFontSize;

    // Convert logical start and end to actual positions in text
    const actualStart = indexMapping[start];
    const actualEnd = indexMapping[end - 1] + 1; // end is exclusive, so add 1

    if (currentPosition < actualStart) {
      const plainText = text.substring(currentPosition, actualStart);
      content.push({ text: plainText, style: {} });
      currentPosition = actualStart;
    }

    const contentText = text.substring(actualStart, actualEnd);
    const transformedValue = transformValue(contentText);
    content.push(
      !!type
        ? { text: transformedValue, type: "dynamic", style: restTextStyle }
        : { text: transformedValue, style: restTextStyle }
    );
    currentPosition = actualEnd;
  }

  if (currentPosition < text.length) {
    const plainText = text.substring(currentPosition);
    content.push({ text: plainText, style: {} });
  }

  return content;
};

export const convertCanvasPxToScreenDimensionPx = (
  obj,
  screenDimension,
  canvasDimension
) => {
  let convertedObj = { ...obj };
  convertedObj.left = Math.round(
    (obj.left * screenDimension.width) / canvasDimension.width
  );
  convertedObj.top = Math.round(
    (obj.top * screenDimension.height) / canvasDimension.height
  );
  convertedObj.width = Math.round(
    (obj.width * screenDimension.width) / canvasDimension.width
  );
  convertedObj.height = Math.round(
    (obj.height * screenDimension.height) / canvasDimension.height
  );
  return convertedObj;
};
export const convertScreenDimensionPxToCanvasPx = (
  obj,
  screenDimension,
  canvasDimension
) => {
  let convertedObj = { ...obj };
  convertedObj.left =
    (obj.left * canvasDimension.width) / screenDimension.width;
  convertedObj.top =
    (obj.top * canvasDimension.height) / screenDimension.height;
  convertedObj.width =
    (obj.width * canvasDimension.width) / screenDimension.width;
  convertedObj.height =
    (obj.height * canvasDimension.height) / screenDimension.height;
  return convertedObj;
};

export const convertToFontSize = (
  canvasDimension,
  screenDimension,
  size,
  toDesign
) => {
  let { width, height } = screenDimension;

  const widthRatio = width / canvasDimension.width;
  const heightRatio = height / canvasDimension.height;

  // Use the average of width and height ratios to maintain aspect ratio
  const averageRatio = Math.min(widthRatio, heightRatio);

  const scaledSize = toDesign
    ? Math.round(size * averageRatio)
    : size / averageRatio;
  // Calculate scaled font size
  return scaledSize;
};

const canvasToDesign = (arr, screenDimension, canvasDimension) => {
  return arr.map((obj) => {
    const { type, ...rest } = obj;
    let modifiedObj = { ...rest, type: type };
    modifiedObj = convertCanvasPxToScreenDimensionPx(
      modifiedObj,
      screenDimension,
      canvasDimension
    );
    // Remove selected properties
    delete modifiedObj.strokeDashArray;
    delete modifiedObj.strokeLineCap;
    delete modifiedObj.strokeDashOffset;
    delete modifiedObj.strokeLineJoin;
    delete modifiedObj.strokeUniform;
    delete modifiedObj.strokeMiterLimit;
    delete modifiedObj.fillRule;
    delete modifiedObj.paintFirst;
    delete modifiedObj.globalCompositeOperation;
    delete modifiedObj.skewX;
    delete modifiedObj.skewY;
    delete modifiedObj.version;
    delete modifiedObj.originX;
    delete modifiedObj.originY;
    delete modifiedObj.scaleX;
    delete modifiedObj.scaleY;
    delete modifiedObj.rx;
    delete modifiedObj.ry;
    if (type === "IText") {
      delete modifiedObj.overline;
      delete modifiedObj.linethrough;
      delete modifiedObj.lineHeight;
      delete modifiedObj.textBackgroundColor;
      delete modifiedObj.charSpacing;
      delete modifiedObj.direction;
      delete modifiedObj.path;
      delete modifiedObj.pathStartOffset;
      delete modifiedObj.minWidth;
      delete modifiedObj.splitByGrapheme;
      delete modifiedObj.pathSide;
      delete modifiedObj.pathAlign;
      delete modifiedObj.fill;
      modifiedObj.settings = {
        content: createContentArray(
          modifiedObj.text,
          modifiedObj.styles,
          canvasDimension,
          screenDimension,
          true
        ),
        fontFamily: modifiedObj.fontFamily,
        text: modifiedObj.text,
        fontStyle: modifiedObj.fontStyle,
        fontWeight: modifiedObj.fontWeight,
        textAlign: modifiedObj.textAlign,
        fontSize: convertToFontSize(
          canvasDimension,
          screenDimension,
          modifiedObj.fontSize,
          true
        ),
        underline: modifiedObj.undeline,
      };
      delete modifiedObj.fontFamily;
      delete modifiedObj.text;
      delete modifiedObj.fontStyle;
      delete modifiedObj.fontWeight;
      delete modifiedObj.textAlign;
      delete modifiedObj.fontSize;
      delete modifiedObj.undeline;
      delete modifiedObj.styles;
    }

    // Extract src from multimedia path if type is Multimedia
    if (type === "Multimedia" && modifiedObj.settings?.path) {
      modifiedObj.fill = modifiedObj.objects[0].fill;
      modifiedObj.stroke = modifiedObj.objects[0].stroke;
      modifiedObj.strokeWidth = modifiedObj.objects[0].strokeWidth;
      modifiedObj.settings = {
        path: modifiedObj.settings.path,
        objectFit: modifiedObj.objects[1].objectFit,
        mediaType: modifiedObj.settings.mediaType,
      };
      delete modifiedObj.objects;
    }
    if (type === "Line") {
      if (modifiedObj.y1 * modifiedObj.x1 <= 0 && modifiedObj.x1 <= 0) {
        modifiedObj.startingPoint = "bottomLeft";
      } else {
        modifiedObj.startingPoint = "topLeft";
      }
      delete modifiedObj.x1;
      delete modifiedObj.y1;
      delete modifiedObj.x2;
      delete modifiedObj.y2;
    }
    if (type === "Weather") {
      modifiedObj.fill = modifiedObj.objects[0].fill;
      modifiedObj.stroke = modifiedObj.objects[0].stroke;
      modifiedObj.strokeWidth = modifiedObj.objects[0].strokeWidth;
      delete modifiedObj.objects;
      delete modifiedObj.src;
    }
    if (type === "QRCode") {
      delete modifiedObj.objects;
      delete modifiedObj.src;
      delete modifiedObj.fill;
      delete modifiedObj.stroke;
      delete modifiedObj.strokeWidth;
    }
    if (type === "RSSFeed") {
      delete modifiedObj.objects;
      delete modifiedObj.fill;
      delete modifiedObj.stroke;
      delete modifiedObj.strokeWidth;
    }
    if (type === "Button") {
      modifiedObj.triggers = convertTriggersToSchema(modifiedObj.triggers);
    }

    return modifiedObj;
  });
};

export const exportCanvas = (canvas, selectedDesign, screenIndex) => {
  let newDesignConfiguration = canvas.toJSON(
    [
      "id",
      "objectFit",
      "content",
      "path",
      "settings",
      "superType",
      "name",
      "triggers",
      "startingPoint",
      "color",
    ],
    true
  );
  const previewImageUrl = canvas.toDataURL({ format: "png" });
  newDesignConfiguration = {
    ...selectedDesign.Configuration.screens[screenIndex],
    objects: canvasToDesign(
      newDesignConfiguration.objects,
      selectedDesign.Configuration.screens[screenIndex].resolution,
      {
        width: canvas.width / canvas.viewportZoom,
        height: canvas.height / canvas.viewportZoom,
      }
    ),
    previewImageUrl: previewImageUrl,
  };

  return newDesignConfiguration;
};

export const addElement = (element, position, canvas, multiplier) => {
  let object: any = {};
  const isSelectable = canvas.get("selection");
  let objectOptions: any = {
    ...FabricItemOptions(element, multiplier),
    selectable: isSelectable,
  };
  if (position)
    objectOptions = {
      ...objectOptions,
      left: position.left,
      top: position.top,
    };
  if (element === "Multimedia") {
    object = new fabric.Rect({
      ...objectOptions,
      fill: "#FFFFFFFF",
      stroke: "#000000FF",
      strokeWidth: 1,
      path: "",
    });
  } else if (element === "IText") {
    object = new fabric.Textbox("Text", objectOptions);
    const { deleteControl, ...controls } = object.controls;
    object.controls = controls;

    // Apply initial fontSize to each character individually
    const fontSize = 64 * multiplier;
    const text = object.text;
    object.setSelectionStyles({ fontSize: fontSize }, 0, text.length);
  } else {
    object = new fabric[element](objectOptions);
    const { deleteControl, ...controls } = object.controls;
    object.controls = controls;
  }

  canvas.add(object);
  canvas.renderAll();
};

export const addCustomObject = (type, canvas, resolution, position?: any) => {
  let size = { width: 128, height: 128 };
  if (type === "Weather") {
    size = { width: 289.578125, height: 252.5390625 };
  } else if (type === "RSSFeed") {
    size = {
      width: canvas.width / canvas.viewportZoom,
      height: (50 * canvas.height) / resolution.height,
    };
  } else if (type === "Button") {
    size = { width: 280.15, height: 86.2 };
  } else if (type === "Embed") {
    size = { width: 300, height: 150 };
  }
  if (position) {
    if (type !== "RSSFeed") {
      size = { ...size, ...position };
    }
  }
  const element = CustomItemsPicker({
    canvasDimension: {
      width: canvas.width / canvas.viewportZoom,
      height: canvas.height / canvas.viewportZoom,
    },
    screenDimension: resolution,
    type: type,
    size,
    ...position,
  });
  createSnapshotOfElement(element, size, canvas, type);
};

fabric.Canvas.prototype.getAbsoluteCoords = function (object) {
  return {
    left: object.left + this._offset.left,
    top: object.top + this._offset.top,
  };
};

const calculateFabricObjectAreasAndHideImage = (
  canvas,
  imageArea,
  imageElement
) => {
  const fabricObjects = canvas
    .getObjects()
    .filter((obj) => obj.type !== "addMediaArea");

  for (const fabricObject of fabricObjects) {
    const objectArea = {
      left: fabricObject.left,
      top: fabricObject.top,
      right: fabricObject.left + fabricObject.width,
      bottom: fabricObject.top + fabricObject.height,
    };

    if (
      objectArea.left <= imageArea.right &&
      objectArea.right >= imageArea.left &&
      objectArea.top <= imageArea.bottom &&
      objectArea.bottom >= imageArea.top
    ) {
      imageElement.style.display = "none";
      break; // No need to check further if the image is hidden
    } else {
      imageElement.style.display = "block";
    }
  }
  if (fabricObjects.length === 0) imageElement.style.display = "block";
  if (canvas.scrollingZoom > 1) imageElement.style.display = "none";
};

export const addMediaArea = (dimensions, canvas, layoutIndex) => {
  //First remove all existing addMediaArea objects
  const objects = canvas.getObjects();
  for (let i = objects.length - 1; i >= 0; i--) {
    if (objects[i].type === "addMediaArea") {
      canvas.remove(objects[i]);
    }
  }
  dimensions.forEach((dimension, index) => {
    // Create a transparent rectangle
    const rect = new fabric.Rect({
      left: dimension.left, // Adjust the position as needed
      top: dimension.top, // Adjust the position as needed
      width: dimension.width - 2,
      height: dimension.height - 2,
      fill: "transparent",
      stroke: "#000000",
      strokeWidth: 2,
      selectable: false, // The group will not be selectable
      hasControls: false, // The group will not have controls (resizing handles)
    });
    // Create text
    const text = new fabric.Text("Drag and drop media here", {
      fontFamily: "Poppins",
      fontSize: 16,
      fill: "#000000",
      originX: "center",
      originY: "center",
      selectable: false, // The text will not be selectable
      hasControls: false, // The text will not have controls (resizing handles)
    });

    text.set({
      left: dimension.left + rect.width / 2,
      top: dimension.top + rect.height / 2,
    });

    // Create a group to combine the rectangle, text, and delete icon
    const group = new fabric.Group([rect, text], {
      type: "addMediaArea",
      dataName: `dimension-${index}`,
      layoutIndex: layoutIndex,
      selectable: false, // The group will not be selectable
      hasControls: true, // The group will not have controls (resizing handles)
    });

    // Add the delete control to the group
    group.controls = {
      deleteControl: fabric.Object.prototype.controls.deleteControl,
    };
    // Add the group to the canvas at bottom of stacking order
    canvas.insertAt(group, 0);

    // Render the delete icon using absolute coordinates
    let img = createDeleteIconImage(`dimension-${index}`);
    img.style.position = "absolute";

    function positionBtn(obj) {
      let absCoords = canvas.getAbsoluteCoords(obj);
      img.style.left = `${
        absCoords.left + obj.width * canvas.viewportZoom - 40
      }px`; // Adjust the left position as needed
      img.style.top = `${absCoords.top * canvas.viewportZoom + 16}px`; // Adjust the top position as needed
    }

    positionBtn(group);

    img.style.cursor = "pointer";
    img.style.display = "none";
    document.body.appendChild(img);

    // Handle the click event for the delete icon and hover event
    img.addEventListener("click", () => {
      canvas.remove(group); // Remove the associated group (rectangle and text) from the canvas
      img.remove(); // Remove the delete icon DOM element
    });

    img.addEventListener("mouseover", (event) => {
      img.style.display = "block";
    });

    // Update the position of the delete icon when the group is moved or resized
    group.on("moving", () => {
      positionBtn(group);
    });

    group.on("scaling", () => {
      positionBtn(group);
    });

    group.on("mouseover", () => {
      positionBtn(group);
      calculateFabricObjectAreasAndHideImage(
        canvas,
        {
          left: group.left + group.width * canvas.viewportZoom - 40,
          top: group.top * canvas.viewportZoom + 16,
          right: group.left + group.width * canvas.viewportZoom - 16,
          bottom: group.top * canvas.viewportZoom + 40,
        },
        img
      );
      canvas.renderAll();
    });

    group.on("mouseout", () => {
      canvas.renderAll();
      img.style.display = "none";
    });
  });
  canvas.renderAll();
};

export const createSplitAreas = (index, canvas) => {
  const canvasWidth = canvas.getWidth() / canvas.viewportZoom;
  const canvasHeight = canvas.getHeight() / canvas.viewportZoom;
  const halfWidth = canvasWidth / 2;
  const halfHeight = canvasHeight / 2;
  let dimensions = [];
  if (index === 1) {
    // Create the first rectangle (left half)
    const area1 = {
      left: 0,
      top: 0,
      width: canvasWidth / 2,
      height: canvasHeight,
    };

    // Create the second rectangle (right half)
    const area2 = {
      left: canvasWidth / 2,
      top: 0,
      width: canvasWidth / 2,
      height: canvasHeight,
    };

    dimensions = [area1, area2];
  } else if (index === 3) {
    // Create the first rectangle (top-left)
    const area1 = {
      left: 0,
      top: 0,
      width: halfWidth,
      height: halfHeight,
    };

    // Create the second rectangle (top-right)
    const area2 = {
      left: halfWidth,
      top: 0,
      width: halfWidth,
      height: halfHeight,
    };

    // Create the third rectangle (bottom-left)
    const area3 = {
      left: 0,
      top: halfHeight,
      width: halfWidth,
      height: halfHeight,
    };

    // Create the fourth rectangle (bottom-right)
    const area4 = {
      left: halfWidth,
      top: halfHeight,
      width: halfWidth,
      height: halfHeight,
    };

    dimensions = [area1, area2, area3, area4];
  } else if (index === 2) {
    // Create the first rectangle (top half)
    const area1 = {
      left: 0,
      top: 0,
      width: canvasWidth,
      height: canvasHeight / 2,
    };

    // Create the second rectangle (bottom half)
    const area2 = {
      left: 0,
      top: canvasHeight / 2,
      width: canvasWidth,
      height: canvasHeight / 2,
    };

    dimensions = [area1, area2];
  }
  addMediaArea(dimensions, canvas, index);
};

const useToolbarHandlers = ({
  canvas,
  screenIndex,
  selectedDesign,
  handleStartDrawing,
  setSelectedObject,
  setCursorState,
}: {
  canvas;
  screenIndex;
  selectedDesign;
  handleStartDrawing;
  setSelectedObject;
  setCursorState?: any;
}) => {
  const dispatch = useDispatch();
  // Define the deleteControl (similar to your previous code)
  fabric.Object.prototype.controls.deleteControl = new fabric.Control({
    x: 0.5,
    y: -0.5,
    offsetY: fabric.Object.prototype.controls.deleteControl?.offsetY ?? 16,
    offsetX: fabric.Object.prototype.controls.deleteControl?.offsetX ?? -16,
    cursorStyle: "pointer",
    mouseDownHandler: function (eventData, options) {
      // Handle the delete functionality here
      const canvas = options.target.canvas;
      const object = options.target;
      if (options.action !== "drag") {
        setSelectedObject(null);
        canvas.remove(object);
      }
    },
    render: function (ctx, left, top, styleOverride, fabricObject) {
      // Render the delete icon (you can use an image or draw a shape like 'X')
      // For example, to draw a simple 'X' shape:
      if (fabricObject.superType !== undefined) {
        ctx.beginPath();
        ctx.moveTo(left - 8, top - 8);
        ctx.lineTo(left + 8, top + 8);
        ctx.moveTo(left - 8, top + 8);
        ctx.lineTo(left + 8, top - 8);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    },
    cornerSize: 24,
  });

  const [openCustomPopover, setOpenCustomPopover] = useState({
    popoverName: "",
    open: false,
    position: { top: 0, left: 0 },
  });
  const [selectedListObject, setSelectedListObject] = useState(null);

  const { removeCirclesFromLines } = useDrawingHandlers({ canvas });

  const handleSaveDesign = () => {
    removeCirclesFromLines();
    const newDesignConfiguration = exportCanvas(
      canvas,
      selectedDesign,
      screenIndex
    );
    const updatedScreens = selectedDesign.Configuration.screens.map(
      (screen, i) => {
        if (i === screenIndex) return newDesignConfiguration;
        else return screen;
      }
    );
    const updatedScreensWithoutPreviewImgs = updatedScreens.map((screen) => {
      let newScreen = { ...screen };
      delete newScreen.previewImageUrl;
      return newScreen;
    });
    const updatedDesign = {
      ...selectedDesign,
      Configuration: { screens: updatedScreensWithoutPreviewImgs },
    };

    // Dispatch the updated design to Redux store
    dispatch(fabricPageActions.updateDesign(updatedDesign));
  };

  const handleReturn = () => {
    const objs = canvas.getObjects();
    objs.forEach((obj) => {
      canvas.remove(obj);
    });
    canvas.setBackgroundColor("#FFFFFF");
    canvas.renderAll();
  };

  const handleOpenPopover = (popoverName) => (event) => {
    const boundaryRect = event.currentTarget.getBoundingClientRect();
    const position = {
      top: boundaryRect.top,
      left: boundaryRect.right + 16, // Adjust as needed, e.g., add some pixels
    };
    setOpenCustomPopover({
      popoverName: popoverName,
      open: true,
      position: { top: position?.top, left: position?.left },
    });
  };

  const handleClosePopover = () => {
    setOpenCustomPopover({ popoverName: "", open: false, position: null });
  };

  const handleClickDrawerSubItem = (id, itemNo) => {
    const multiplier =
      canvas.width /
      selectedDesign.Configuration.screens[screenIndex].resolution.width;
    if (id === "Elements") {
      const objectTypes = ["Triangle", "Rect", "Ellipse", "IText", "Line"];
      if (itemNo === 4) {
        initializeShapes("Line", handleStartDrawing, dispatch);
      } else if (objectTypes[itemNo]) {
        addElement(objectTypes[itemNo], null, canvas, multiplier);
      }
    } else if (id === "Widgets") {
      const widgets = ["Button", "Weather", "RSSFeed", "QRCode", "Embed"];
      addCustomObject(
        widgets[itemNo],
        canvas,
        selectedDesign.Configuration.screens[screenIndex].resolution
      );
    } else if (id === "Pointer") {
      canvas.discardActiveObject();
      setCursorState((prevState) => {
        if (prevState === "pointer" && itemNo === 1) {
          canvas.set("selection", false);
          canvas.set("hoverCursor", "move");
          canvas.forEachObject((obj) => {
            obj.selectable = false;
          });
          canvas.renderAll(); // Render canvas to reflect changes
          return "grab";
        } else if (prevState === "grab" && itemNo === 0) {
          canvas.set("selection", true);
          canvas.set("hoverCursor", "pointer");
          canvas.forEachObject((obj) => {
            if (!obj.dataName) obj.selectable = true;
          });
          canvas.renderAll(); // Render canvas to reflect changes
          return "pointer";
        } else return prevState;
      });
    }
    handleClosePopover();
  };

  const handleDelete = (object) => {
    canvas.remove(object);
    canvas.renderAll();
    setSelectedListObject(null);
    const objects = canvas.getObjects();
  };
  const handleSelectObject = (object) => {
    const objectsSameType = canvas.getObjects(object.type);
    objectsSameType.forEach((obj) => {
      if (obj.id === object.id) {
        canvas.discardActiveObject();
        canvas.setActiveObject(obj);
        setSelectedObject(obj);
        canvas.requestRenderAll();
      }
    });
    setSelectedListObject(object);
  };

  const handleUpdateDesignName = (newName: string) => {
    if (selectedDesign && newName.trim() !== "") {
      const updatedDesign = {
        ...selectedDesign,
        Name: newName.trim(),
      };
      dispatch(fabricPageActions.updateDesign(updatedDesign));
    }
  };

  return {
    handleClosePopover,
    handleOpenPopover,
    selectedListObject,
    handleDelete,
    handleSelectObject,
    handleClickDrawerSubItem,
    handleSaveDesign,
    handleReturn,
    openCustomPopover,
    handleUpdateDesignName,
  };
};

export default useToolbarHandlers;
