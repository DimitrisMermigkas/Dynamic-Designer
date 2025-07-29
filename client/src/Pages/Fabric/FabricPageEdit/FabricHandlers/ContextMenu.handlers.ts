import { useState } from "react";
import {
  addCustomObject,
  addElement,
  initializeShapes,
} from "./Toolbar.handlers";
import { useDispatch } from "react-redux";
const useContextMenuHandlers = ({
  selectedObject,
  setSelectedObject,
  canvas,
  selectedDesign,
  screenIndex,
}) => {
  const dispatch = useDispatch();

  const [pointerPosition, setPointerPosition] = useState(null);
  const [itemMenuMouseX, setItemMenuMouseX] = useState(null);
  const [itemMenuMouseY, setItemMenuMouseY] = useState(null);
  const [itemMenuData, setItemMenuData] = useState(null);
  const [openSecondList, setOpenSecondList] = useState(false);

  const handleMouseEnter = () => {
    setOpenSecondList(true);
  };

  const addObjects = (index, necessaryProp1, necessaryProp2) => {
    const position = {
      left: Math.round(pointerPosition.x),
      top: Math.round(pointerPosition.y),
    };
    if (index === 0) {
      const multiplier =
        canvas.width /
        selectedDesign.Configuration.screens[screenIndex].resolution.width;

      addElement(necessaryProp1, position, necessaryProp2, multiplier);
    } else if (index === 1) {
      initializeShapes(necessaryProp1, necessaryProp2, dispatch);
    } else if (index === 2) {
      addCustomObject(
        necessaryProp1,
        necessaryProp2,
        selectedDesign.Configuration.screens[screenIndex].resolution,
        position
      );
    }
    handleCloseItemMenu();
  };
  const handleStackingOrder = (to) => {
    const activeObj = canvas.getActiveObject();
    canvas[to](activeObj);
    canvas.renderAll();
  };

  const handleDuplicate = (fabricObject) => {
    // Clone the fabric object
    fabricObject.clone((cloned) => {
      // Calculate new top and left positions
      const newTop = fabricObject.top + 10;
      const newLeft = fabricObject.left + 10;

      // Set the new top and left positions for the cloned object
      cloned.set({ top: newTop, left: newLeft });
      // Add the cloned object to the canvas
      canvas.add(cloned);

      // Render the canvas to see the changes
      canvas.renderAll();
    });
  };

  const onContextMenu = (event) => {
    if (
      (event.target &&
        event.target.type !== "addMediaArea" &&
        event.target.type !== "Line") ||
      (event.target && event.target.isPoint)
    ) {
      setItemMenuData(event.target);
      setSelectedObject(event.target);
    } else {
      setItemMenuData(null);
    }
    setPointerPosition(event.pointer);
    event.e.preventDefault();
    event.e.stopPropagation();
    setItemMenuMouseX(event.e.clientX - 2);
    setItemMenuMouseY(event.e.clientY - 4);
  };

  const handleCloseItemMenu = () => {
    setOpenSecondList(false);
    setItemMenuMouseX(null);
    setItemMenuMouseY(null);
  };

  const itemMenuClick = (type) => {
    if (type === "delete") {
      if (selectedObject) {
        setSelectedObject(null);
        if (selectedObject.type === "activeSelection") {
          const objects = selectedObject.getObjects();
          let ids = [];
          objects.forEach((obj) => {
            ids = [...ids, obj.id];
            canvas.remove(obj);
          });
        } else {
          canvas.remove(selectedObject);
        }
      }
    } else if (type === "sendToBack") {
      handleStackingOrder("sendToBack");
    } else if (type === "sendBackwards") {
      handleStackingOrder("sendBackwards");
    } else if (type === "bringForward") {
      handleStackingOrder("bringForward");
    } else if (type === "bringToFront") {
      handleStackingOrder("bringToFront");
    } else if (type === "duplicate") {
      handleDuplicate(itemMenuData);
    }
    canvas.fire("objectPos:changed", { canvas: canvas });
    // } else if (type === "removeMedia") {
    //   handleMedia(itemMenuData.ID, droppedTiles);
    // }

    handleCloseItemMenu();
  };
  return {
    itemMenuMouseX,
    itemMenuMouseY,
    itemMenuData,
    onContextMenu,
    itemMenuClick,
    handleCloseItemMenu,
    openSecondList,
    handleMouseEnter,
    addObjects,
  };
};

export default useContextMenuHandlers;
