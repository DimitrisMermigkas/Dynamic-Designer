import { fabric } from "fabric";

const useLinesHandlers = ({ canvas }) => {
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

  return {
    updateLine,
    createCirclesForLine,
    removeCirclesFromLines,
  };
};

export default useLinesHandlers;
