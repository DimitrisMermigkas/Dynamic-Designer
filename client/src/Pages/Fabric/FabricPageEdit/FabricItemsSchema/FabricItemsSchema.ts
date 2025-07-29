import { v4 as uuid } from "uuid";

export const fabricItems = ["Triangle", "Rect", "Ellipse", "Text", "Line"];
export const customWidgets = ["Button", "Weather", "RSSFeed", "QRCode"];

const defaultItemOptionsFunc = (multiplier?: number) => {
  return {
    hasControls: true,
    hasBorders: true,
    selectable: true,
    lockMovementX: false,
    lockMovementY: false,
    hoverCursor: "move",
    editable: true,
    rotation: 0,
    left: 200 * multiplier,
    top: 300 * multiplier,
    objectCaching: false,
    strokeUniform: true,
    lockScalingFlip: true,
  };
};

const shapes = ["Triangle", "Rect", "Ellipse"];
const drawing = ["Line", "Polygon", "Arrow"];

const FabricItemOptions = (type, multiplier?: number) => {
  let options = {};
  const defaultItemOptions = defaultItemOptionsFunc(multiplier);
  if (shapes.includes(type)) {
    options = Object.assign(
      {
        fill: "#ffffffff",
        stroke: "#000000ff",
        type: type,
        width: 50 * multiplier,
        height: 50 * multiplier,
        strokeWidth: 2,
        name: "New shape",
        id: uuid(),
      },
      defaultItemOptions
    );
    if (type === "Ellipse")
      options = {
        ...options,
        ry: 25 * multiplier,
        rx: 25 * multiplier,
      };
  } else if (type === "Multimedia") {
    options = Object.assign(
      {
        type: type,
        width: 400 * multiplier,
        height: 200 * multiplier,
        name: "New media",
        id: uuid(),
        objectCaching: false,
      },
      defaultItemOptions
    );
  } else if (type === "IText") {
    options = Object.assign(
      {
        type: type,
        width: 60,
        height: 30,
        name: "New text",
        text: "Text",
        fontFamily: "Poppins",
        autoSetWidth: false,
        color: "#000000FF",
        fill: "#000000FF",
        stroke: null,
        id: uuid(),
        dirty: true,
      },
      defaultItemOptions
    );
  } else if (drawing.includes(type)) {
    const modifiedObject = Object.assign(
      {},
      { ...defaultItemOptions, hasControls: false }
    );

    // Exclude the 'top' and 'left' properties
    delete modifiedObject.top;
    delete modifiedObject.left;
    options = Object.assign(
      {
        type: type,
        name: "New Line",
        id: uuid(),
      },
      modifiedObject
    );
  }
  return options;
};

export default FabricItemOptions;
