import { fabric } from "fabric";
import { v4 as uuid } from "uuid";
import Line from "../FabricObjects/Line";
import useObjectCustomizationHandlers from "./ObjectCustomization.handlers";
import FabricItemOptions from "../FabricItemsSchema/FabricItemsSchema";
import { fabricPageActions } from "../../FabricPageRedAct";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../../reduxConfig/reduxHooks";
import { removePolygonMask } from "./Edit.handlers";
import { store } from "../../../../reduxConfig/reduxStoreConfig";

const useDrawingHandlers = ({ canvas }) => {
  const { centerObject } = useObjectCustomizationHandlers({ canvas });

  const dispatch = useAppDispatch();
  const pointArray = useAppSelector(
    (state) => state.fabricPageReducer.pointArray
  );
  const lineArray = useAppSelector(
    (state) => state.fabricPageReducer.lineArray
  );
  const activeLine = useAppSelector(
    (state) => state.fabricPageReducer.activeLine
  );
  const activeShape = useAppSelector(
    (state) => state.fabricPageReducer.activeShape
  );

  //Line Functionality

  const lineFunctionality = {
    addPoint: (opt) => {
      const { absolutePointer } = opt;
      const { x, y } = absolutePointer;
      const circle = new fabric.Circle({
        radius: 3,
        fill: "#ffffff",
        stroke: "#333333",
        strokeWidth: 0.5,
        left: x,
        top: y,
        selectable: false,
        hasBorders: false,
        hasControls: false,
        originX: "center",
        originY: "center",
        hoverCursor: "pointer",
      });
      if (!pointArray.length) {
        circle.set({
          fill: "red",
        });
      }
      const points = [x, y, x, y];
      let updatedOptions = FabricItemOptions("Line");
      updatedOptions = {
        ...updatedOptions,
        strokeWidth: 2,
        fill: "#999999",
        stroke: "#999999",
        originX: "center",
        originY: "center",
        selectable: false,
        hasBorders: false,
        hasControls: false,
        evented: false,
      };
      const newLine = new Line(points, updatedOptions);
      newLine.set({
        class: "line",
      });
      dispatch(fabricPageActions.setActiveLine(newLine));
      dispatch(fabricPageActions.setPointArray([circle]));
      canvas.add(newLine);
      canvas.add(circle);
    },
    generate: (opt) => {
      const { absolutePointer } = opt;
      const { x, y } = absolutePointer;
      let points = [];
      const id = uuid();
      pointArray.forEach((point) => {
        points = points.concat(point.left, point.top, x, y);
        canvas.remove(point);
      });
      canvas.remove(activeLine);
      const option = {
        id,
        points,
        type: "Line",
        stroke: "#000000FF",
        strokeWidth: 3,
        opacity: 1,
        objectCaching: false,
        name: "New line",
      };
      let updatedOptions = FabricItemOptions("Line");
      updatedOptions = { ...updatedOptions, ...option };
      const newLine = new Line(points, updatedOptions);
      canvas.add(newLine);
      centerObject(newLine, false);
      dispatch(fabricPageActions.setActiveLine(null));
      dispatch(fabricPageActions.setPointArray([]));
    },
  };

  const cancelLine = (canvas) => {
    dispatch(fabricPageActions.setStartDrawing({ value: false, element: "" }));
    removePolygonMask();
    const activePoints = store.getState().fabricPageReducer.pointArray;
    const activeLine = store.getState().fabricPageReducer.activeLine;
    activePoints.forEach((point) => {
      canvas.remove(point);
    });
    canvas.remove(activeLine);
    dispatch(fabricPageActions.setActiveLine(null));
    dispatch(fabricPageActions.setPointArray([]));
    canvas.requestRenderAll();
  };
  const createLine = (event) => {
    if (pointArray.length > 0 && activeLine !== null) {
      lineFunctionality.generate(event);
    } else {
      lineFunctionality.addPoint(event);
    }
  };

  const previewLine = (event) => {
    if (activeLine && activeLine.class === "line") {
      const pointer = canvas.getPointer(event.e);
      activeLine.set({ x2: pointer.x, y2: pointer.y });
    }
    canvas.requestRenderAll();
  };

  //Polygon Functionality

  const polygonFunctionality = {
    addPoint: (opt) => {
      const { e, absolutePointer } = opt;
      const { x, y } = absolutePointer;
      const circle = new fabric.Circle({
        radius: 1,
        fill: "#ffffff",
        stroke: "#333333",
        strokeWidth: 0.5,
        left: x,
        top: y,
        selectable: false,
        hasBorders: false,
        hasControls: false,
        originX: "center",
        originY: "center",
        hoverCursor: "pointer",
      });
      circle.set({
        id: uuid(),
      });
      if (!pointArray.length) {
        circle.set({
          fill: "red",
        });
      }
      const points = [x, y, x, y];
      const line = new Line(points, {
        strokeWidth: 1,
        fill: "#999999",
        stroke: "#999999",
        originX: "center",
        originY: "center",
        selectable: false,
        hasBorders: false,
        hasControls: false,
        evented: false,
      });
      line.set({
        class: "line",
      });
      if (activeShape) {
        const position = canvas.getPointer(e);
        const activeShapePoints = activeShape.get("points");
        activeShapePoints.push({
          x: position.x,
          y: position.y,
        });
        const polygon = new fabric.Polygon(activeShapePoints, {
          stroke: "#333333",
          strokeWidth: 1,
          fill: "#cccccc",
          opacity: 0.1,
          selectable: false,
          hasBorders: false,
          hasControls: false,
          evented: false,
        });
        canvas.remove(activeShape);
        canvas.add(polygon);
        dispatch(fabricPageActions.setActiveShape(polygon));
        canvas.renderAll();
      } else {
        const polyPoint = [{ x, y }];
        const polygon = new fabric.Polygon(polyPoint, {
          stroke: "#333333",
          strokeWidth: 1,
          fill: "#cccccc",
          opacity: 0.1,
          selectable: false,
          hasBorders: false,
          hasControls: false,
          evented: false,
        });
        dispatch(fabricPageActions.setActiveShape(polygon));
        canvas.add(polygon);
      }
      dispatch(fabricPageActions.setActiveLine(line));
      dispatch(fabricPageActions.setPointArray([circle]));
      dispatch(fabricPageActions.setLineArray(line));
      canvas.add(line);
      canvas.add(circle);
    },
    generate: (pointArray) => {
      const points = [];
      const id = uuid();
      pointArray.forEach((point) => {
        points.push({
          x: point.left,
          y: point.top,
        });
        canvas.remove(point);
      });
      lineArray.forEach((line) => {
        canvas.remove(line);
      });
      canvas.remove(activeShape).remove(activeLine);
      const option = {
        id,
        points,
        type: "polygon",
        stroke: "rgba(0, 0, 0, 1)",
        strokeWidth: 1,
        fill: "rgba(0, 0, 0, 0.25)",
        opacity: 1,
        objectCaching: false,
        name: "New polygon",
      };
      let updatedOptions = FabricItemOptions("Polygon");
      updatedOptions = { ...updatedOptions, ...option };
      const newPolygon = new Line(points, updatedOptions);
      canvas.add(newPolygon);
      centerObject(newPolygon, false);
      dispatch(fabricPageActions.setActiveLine(null));
      dispatch(fabricPageActions.setPointArray([]));
      dispatch(fabricPageActions.setLineArray([]));
      dispatch(fabricPageActions.setActiveShape(null));
    },
  };

  const createPolygon = (event) => {
    if (
      event.target &&
      pointArray.length &&
      event.target.id === pointArray[0].id
    ) {
      polygonFunctionality.generate(pointArray);
    } else {
      polygonFunctionality.addPoint(event);
    }
  };

  const previewPolygon = (event) => {
    if (activeLine && activeLine.class === "Line") {
      const pointer = canvas.getPointer(event.e);
      activeLine.set({ x2: pointer.x, y2: pointer.y });
      const points = activeShape.get("points");
      points[pointArray.length] = {
        x: pointer.x,
        y: pointer.y,
      };
      activeShape.set({
        points,
      });
      canvas.requestRenderAll();
    }
  };

  const createCirclesForLine = (target) => {
    const objs = canvas.getObjects();
    const hasPoints = objs.filter((obj) => obj.referenceId == target.id);
    if (hasPoints.length == 2) {
      return;
    }
    let centerX = target.getCenterPoint().x;
    let centerY = target.getCenterPoint().y;

    let offset = target.calcLinePoints();

    const circle1 = new fabric.Circle({
      left: centerX + offset.x1,
      top: centerY + offset.y1,
      radius: 4,
      fill: "#fff",
      stroke: "#666",
      strokeWidth: 2,
      originX: "center",
      originY: "center",
      hasControls: false,
      hasBorders: false,
      selectable: true,
      id: "pointer-1",
      isPoint: true,
      referenceId: target.id,
    });

    const circle2 = new fabric.Circle({
      left: centerX + offset.x2,
      top: centerY + offset.y2,
      radius: 4,
      fill: "#fff",
      stroke: "#666",
      strokeWidth: 2,
      originX: "center",
      originY: "center",
      hasControls: false,
      hasBorders: false,
      selectable: true,
      id: "pointer-2",
      isPoint: true,
      referenceId: target.id,
    });

    target.setCoords();
    // add cirles to canvas
    canvas.add(circle1, circle2);
    // canvas.discardActiveObject();
    canvas.renderAll();
  };
  const updateLine = (target) => {
    // get all objects on the canvas
    let Point1;
    let Point2;
    let Line;
    const objects = canvas.getObjects();
    objects.forEach((obj) => {
      if (obj.isPoint && obj.id == "pointer-1") Point1 = obj;
      if (obj.isPoint && obj.id == "pointer-2") Point2 = obj;
      if (obj.type == "Line") {
        Line = obj;
      }
    });

    if (target.id == "pointer-1") {
      snapCircle(target, Point2);
      Line.set({
        x1: target.left,
        y1: target.top,
        x2: Point2.left,
        y2: Point2.top,
      });
    } else {
      snapCircle(target, Point1);
      Line.set({
        x1: Point1.left,
        y1: Point1.top,
        x2: target.left,
        y2: target.top,
      });
    }
    Line.setCoords();
  };

  const snapCircle = (movingObject, otherEndPoint) => {
    // set the tolerance threshold for snapping
    const snapThreshold = 7;

    // check if the moving object is close enough to each line of otherEndPoint
    if (Math.abs(movingObject.left - otherEndPoint.left) < snapThreshold) {
      movingObject.set({ left: otherEndPoint.left }); // snap to left line
    } else if (
      Math.abs(
        movingObject.left +
          movingObject.width -
          otherEndPoint.left -
          otherEndPoint.width
      ) < snapThreshold
    ) {
      movingObject.set({
        left: otherEndPoint.left + otherEndPoint.width - movingObject.width,
      }); // snap to right line
    }

    if (Math.abs(movingObject.top - otherEndPoint.top) < snapThreshold) {
      movingObject.set({ top: otherEndPoint.top }); // snap to top line
    } else if (
      Math.abs(
        movingObject.top +
          movingObject.height -
          otherEndPoint.top -
          otherEndPoint.height
      ) < snapThreshold
    ) {
      movingObject.set({
        top: otherEndPoint.top + otherEndPoint.height - movingObject.height,
      }); // snap to bottom line
    }
  };
  const removeCirclesFromLines = () => {
    const objects = canvas.getObjects();
    objects.forEach((obj) => {
      if (obj.isPoint) {
        canvas.remove(obj);
        canvas.renderAll();
      }
    });
  };

  const createArea = (startPoint, event) => {
    if (startPoint == null) {
      const pointer = canvas.getPointer(event.e);
      const startPoint = { x: pointer.x, y: pointer.y };
      dispatch(fabricPageActions.setStartingPointer(startPoint));
    } else {
      const pointer = canvas.getPointer(event.e);
      const endPoint = { x: pointer.x, y: pointer.y };

      // Calculate width and height
      const width = Math.abs(endPoint.x - startPoint.x);
      const height = Math.abs(endPoint.y - startPoint.y);

      // Calculate top-left position
      const left = startPoint.x < endPoint.x ? startPoint.x : endPoint.x;
      const top = startPoint.y < endPoint.y ? startPoint.y : endPoint.y;

      // Create a rectangle
      const rectangle = new fabric.Rect({
        left: left,
        top: top,
        width: width,
        height: height,
        fill: "transparent",
        stroke: "red",
        strokeWidth: 2,
      });

      // Add the rectangle to the canvas
      canvas.add(rectangle);
      dispatch(fabricPageActions.setStartSelectingArea(false));
      dispatch(fabricPageActions.setStartingPointer(null));
    }
  };
  return {
    createLine,
    cancelLine,
    previewLine,
    createPolygon,
    previewPolygon,
    pointArray,
    activeLine,
    updateLine,
    createCirclesForLine,
    removeCirclesFromLines,
    createArea,
  };
};

export default useDrawingHandlers;
