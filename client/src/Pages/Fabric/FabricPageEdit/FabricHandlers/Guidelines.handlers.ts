import _ from "lodash";
import { useEffect, useMemo } from "react";
import { fabric } from "fabric";

const useGuidelinesHandlers = ({ canvas, screenResolution }) => {
  //   const viewportTransform = handler.viewportTransform.slice();
  const aligningLineOffset = 0;
  const aligningLineMargin = 3;
  const aligningLineWidth = 1;
  const aligningLineColor = "rgb(255, 0, 0)";
  let verticalLines = [];
  let horizontalLines = [];
  const ctx = useMemo(() => {
    if (canvas) {
      return canvas.getContext("2d");
    }
  }, [canvas]);

  useEffect(() => {
    if (canvas) {
      canvas.on("after:render", function (options) {
        for (let i = verticalLines.length; i--; ) {
          drawVerticalLine(verticalLines[i]);
        }

        for (let i = horizontalLines.length; i--; ) {
          drawHorizontalLine(horizontalLines[i]);
        }
      });
      canvas.on("mouse:up", function (options) {
        verticalLines.length = 0;
        horizontalLines.length = 0;
      });
    }
  }, [canvas]);

  const isInRange = (v1, v2) => {
    v1 = Math.round(v1);
    v2 = Math.round(v2);
    for (
      let i = v1 - aligningLineMargin, len = v1 + aligningLineMargin;
      i <= len;
      i++
    ) {
      if (i === v2) {
        return true;
      }
    }
    return false;
  };

  const drawVerticalLine = (coords) => {
    // coords: { x?: number; y1?: number; y2?: number }
    drawLine(
      coords.x + 0.1,
      coords.y1 > coords.y2 ? coords.y2 : coords.y1,
      coords.x + 0.1,
      coords.y2 > coords.y1 ? coords.y2 : coords.y1,
      coords.show
    );
  };

  const drawHorizontalLine = (coords) => {
    // coords: { y?: number, x1?: number, x2?: number }
    drawLine(
      coords.x1 > coords.x2 ? coords.x2 : coords.x1,
      coords.y + 0.1,
      coords.x2 > coords.x1 ? coords.x2 : coords.x1,
      coords.y + 0.1,
      coords.show
    );
  };

  const drawLine = (x1, y1, x2, y2, showText) => {
    ctx.save();
    ctx.lineWidth = aligningLineWidth;
    ctx.strokeStyle = aligningLineColor;
    ctx.beginPath();
    const startingPoint = {
      x:
        x1 * canvas.scrollingZoom * canvas.viewportZoom +
        canvas.viewportTransform[4],
      y:
        y1 * canvas.scrollingZoom * canvas.viewportZoom +
        canvas.viewportTransform[5],
    };
    const endPoint = {
      x:
        x2 * canvas.scrollingZoom * canvas.viewportZoom +
        canvas.viewportTransform[4],
      y:
        y2 * canvas.scrollingZoom * canvas.viewportZoom +
        canvas.viewportTransform[5],
    };
    ctx.moveTo(startingPoint.x, startingPoint.y);
    ctx.lineTo(endPoint.x, endPoint.y);
    ctx.stroke();

    if (showText) {
      // Calculate the length between the two points
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dim = dx == 0 ? "height" : "width";
      const length = Math.round(
        (Math.sqrt(dx * dx + dy * dy) * screenResolution[dim]) / canvas[dim]
      );

      // Calculate the midpoint of the line
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;

      // Set the font properties for the length text
      const fontSize = 12;
      const fontFamily = "Arial";
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = aligningLineColor;

      // Draw the length text in the middle of the line
      ctx.fillText(
        length,
        midX * canvas.scrollingZoom * canvas.viewportZoom +
          canvas.viewportTransform[4] -
          ctx.measureText(length.toString()).width / 2,
        midY * canvas.scrollingZoom * canvas.viewportZoom +
          canvas.viewportTransform[5] -
          2
      );
    }

    ctx.restore();
  };

  const checkDistanceBelowThreshold = (point1, point2, threshold) => {
    const deltaX = point2.x - point1.x;
    const deltaY = point2.y - point1.y;
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    return distance < threshold;
  };

  const findIntersections = (
    verticalLines,
    horizontalLines,
    margin = 1,
    extension = 50
  ) => {
    const intersections = [];

    for (const vLine of verticalLines) {
      for (const hLine of horizontalLines) {
        // Extend vertical line's range
        const extendedY1 = vLine.y1 - extension;
        const extendedY2 = vLine.y2 + extension;

        // Extend horizontal line's range
        const extendedX1 = hLine.x1 - extension;
        const extendedX2 = hLine.x2 + extension;

        // Check if the vertical line's x-coordinate is within the horizontal line's extended range, including margin
        const xInRange =
          vLine.x >= extendedX1 - margin && vLine.x <= extendedX2 + margin;

        // Check if the horizontal line's y-coordinate is within the vertical line's extended range, including margin
        const yInRange =
          hLine.y >= extendedY1 - margin && hLine.y <= extendedY2 + margin;

        if (xInRange && yInRange) {
          // Intersection point with margin and extended lines
          intersections.push({
            x: vLine.x,
            y: hLine.y,
            centerLineX: vLine.centerLineX || hLine.centerLineX,
            centerLineY: vLine.centerLineY || hLine.centerLineY,
          });
        }
      }
    }
    if (intersections.length > 0) return intersections;
    else return [{ x: verticalLines[0].x, y: horizontalLines[0].y }];
  };

  const getQuadrant = (center, point) => {
    const isBelowThreshold = checkDistanceBelowThreshold(center, point, 2.5);
    if (isBelowThreshold) {
      return { x: "center", y: "center" };
    } else if (point.x > center.x && point.y < center.y) {
      return { x: "left", y: "bottom" };
    } else if (point.x < center.x && point.y < center.y) {
      return { x: "right", y: "bottom" };
    } else if (point.x < center.x && point.y > center.y) {
      return { x: "right", y: "top" };
    } else if (point.x > center.x && point.y > center.y) {
      return { x: "left", y: "top" };
    } else {
      if (point.y == center.y && point.x > center.x) {
        return { x: "left", y: "center" };
      } else if (point.y == center.y && point.x < center.x) {
        return { x: "right", y: "center" };
      } else if (point.x == center.x && point.y < center.y) {
        return { x: "center", y: "bottom" };
      } else if (point.x == center.x && point.y > center.y) {
        return { x: "center", y: "top" };
      }
    }
  };

  const checkPosition = (
    activeCenter,
    activeSize,
    objectCenter,
    objectSize,
    axis
  ) => {
    let condition;
    let showText = true;
    let point1, point2;
    const conditions =
      axis == "X"
        ? [
            "left",
            "right",
            "partial left inside",
            "partial right inside",
            "fully left inside",
            "fully right inside",
          ]
        : [
            "top",
            "bottom",
            "partial top inside",
            "partial bottom inside",
            "fully top inside",
            "fully bottom inside",
          ];
    const halfActiveSize = _.round(activeSize / 2);
    const halfObjectSize = _.round(objectSize / 2);

    if (activeCenter < objectCenter - halfObjectSize - halfActiveSize) {
      // Active object is entirely to the left of the larger object
      condition = conditions[0];
    } else if (activeCenter > objectCenter + halfObjectSize + halfActiveSize) {
      // Active object is entirely to the right of the larger object
      condition = conditions[1];
    } else if (activeCenter < objectCenter - halfObjectSize + halfActiveSize) {
      // Active object is partially inside the larger object on the left side
      condition = conditions[2];
      showText = false;
    } else if (activeCenter > objectCenter + halfObjectSize - halfActiveSize) {
      // Active object is partially inside the larger object on the right side
      condition = conditions[3];
      showText = false;
    } else {
      // Active object is fully inside the larger object, determine closest side
      if (activeCenter < objectCenter) {
        // Active object is closer to the left side
        condition = conditions[4];
      } else {
        // Active object is closer to the right side
        condition = conditions[5];
      }
    }
    if (condition == "left" || condition == "top") {
      point1 = activeCenter + halfActiveSize;
      point2 = objectCenter - halfObjectSize;
    } else if (condition == "right" || condition == "bottom") {
      point1 = objectCenter + halfObjectSize;
      point2 = activeCenter - halfActiveSize;
    } else if (
      condition == "partial left inside" ||
      condition == "partial top inside"
    ) {
      point1 = activeCenter;
      point2 = objectCenter;
    } else if (
      condition == "partial right inside" ||
      condition == "partial bottom inside"
    ) {
      point1 = objectCenter;
      point2 = activeCenter;
    } else if (
      condition == "fully left inside" ||
      condition == "fully top inside"
    ) {
      point1 = objectCenter - halfObjectSize;
      point2 = activeCenter - halfActiveSize;
    } else if (
      condition == "fully right inside" ||
      condition == "fully bottom inside"
    ) {
      point1 = activeCenter + halfActiveSize;
      point2 = objectCenter + halfObjectSize;
    }
    return { point1, point2, showText };
  };

  const updateLinesArray = (linesArray, line) => {
    const keys = Object.keys(line);
    let keyIndex = -1;
    for (let existingLine of linesArray) {
      if (
        existingLine[keys[0]] == line[keys[0]] &&
        existingLine[keys[1]] == line[keys[1]]
      ) {
        keyIndex = 2;
        existingLine[keys[2]] = line[keys[2]];
      } else if (
        existingLine[keys[0]] == line[keys[0]] &&
        existingLine[keys[2]] == line[keys[2]]
      ) {
        keyIndex = 1;
        existingLine[keys[1]] = line[keys[1]];
      } else if (
        existingLine[keys[1]] == line[keys[1]] &&
        existingLine[keys[2]] == line[keys[2]]
      ) {
        keyIndex = 0;
        existingLine[keys[0]] = line[keys[0]];
      }
    }
    const duplicate = linesArray.some(
      (l) =>
        (l[keys[keyIndex]] == line[keys[keyIndex]] &&
          l[keys[1]] == line[keys[1]]) ||
        (l[keys[keyIndex]] == line[keys[keyIndex]] &&
          l[keys[2]] == line[keys[2]])
    );
    if (!duplicate) {
      linesArray.push(line);
    }
  };

  const movingGuidelines = (target, scaling) => {
    const canvasObjects = canvas.getObjects();
    const canv = {
      id: "workarea",
      evented: true,
    };
    canvasObjects.push(canv);
    const activeObjectCenter = target.getCenterPoint();
    const activeObjectCenterX = _.round(activeObjectCenter.x);
    const activeObjectCenterY = _.round(activeObjectCenter.y);
    const activeObjectBoundingRect = target.getBoundingRect();
    const activeObjectHeight = _.round(
      activeObjectBoundingRect.height /
        (canvas.viewportZoom * canvas.scrollingZoom)
    );
    const activeObjectWidth = _.round(
      activeObjectBoundingRect.width /
        (canvas.viewportZoom * canvas.scrollingZoom)
    );

    const canvasWidth = _.round(canvas.width / canvas.viewportZoom);
    const canvasHeight = _.round(canvas.height / canvas.viewportZoom);
    let horizontalInTheRange = false;
    let verticalInTheRange = false;
    for (let i = canvasObjects.length; i--; ) {
      if (
        canvasObjects[i] === target ||
        canvasObjects[i].superType === "port" ||
        canvasObjects[i].superType === "link" ||
        !canvasObjects[i].evented
      ) {
        continue;
      }

      const objectCenter =
        canvasObjects[i].id == "workarea"
          ? { x: canvasWidth / 2, y: canvasHeight / 2 }
          : canvasObjects[i].getCenterPoint();
      const objectCenterX = _.round(objectCenter.x);
      const objectCenterY = _.round(objectCenter.y);
      const objectBoundingRect =
        canvasObjects[i].id == "workarea"
          ? {
              height: canvasHeight * canvas.viewportTransform[3],
              width: canvasWidth * canvas.viewportTransform[0],
            }
          : canvasObjects[i].getBoundingRect();
      const objectHeight = _.round(
        objectBoundingRect.height / (canvas.viewportZoom * canvas.scrollingZoom)
      );
      const objectWidth = _.round(
        objectBoundingRect.width / (canvas.viewportZoom * canvas.scrollingZoom)
      );

      // snap by the left edge
      if (
        isInRange(
          objectCenterX - objectWidth / 2,
          activeObjectCenterX - activeObjectWidth / 2
        ) ||
        isInRange(
          objectCenterX - objectWidth / 2,
          activeObjectCenterX + activeObjectWidth / 2
        )
      ) {
        verticalInTheRange = true;
        if (canvasObjects[i].id === "workarea") {
          const line = {
            x: 0,
            y1: -2000,
            y2: 2000,
            show: false,
          };
          updateLinesArray(verticalLines, line);
        } else {
          const { point1, point2, showText } = checkPosition(
            activeObjectCenterY,
            activeObjectHeight,
            objectCenterY,
            objectHeight,
            "Y"
          );
          const line = {
            x: _.round(objectCenterX - objectWidth / 2),
            y1: point1,
            y2: point2,
            show: showText,
          };
          updateLinesArray(verticalLines, line);
        }
        const isLeft = isInRange(
          objectCenterX - objectWidth / 2,
          activeObjectCenterX - activeObjectWidth / 2
        );
        const left = isLeft ? "left" : "right";
        target.setPositionByOrigin(
          new fabric.Point(
            canvasObjects[i].id === "workarea"
              ? 0
              : _.round(objectCenterX - objectWidth / 2),
            activeObjectCenterY
          ),
          left,
          "center"
        );
      }

      // snap by the right edge
      if (
        isInRange(
          objectCenterX + objectWidth / 2,
          activeObjectCenterX - activeObjectWidth / 2
        ) ||
        isInRange(
          objectCenterX + objectWidth / 2,
          activeObjectCenterX + activeObjectWidth / 2
        )
      ) {
        verticalInTheRange = true;
        if (canvasObjects[i].id === "workarea") {
          const line = {
            x: canvasWidth - 1,
            y1: -2000,
            y2: 2000,
            show: false,
          };
          updateLinesArray(verticalLines, line);
        } else {
          const { point1, point2, showText } = checkPosition(
            activeObjectCenterY,
            activeObjectHeight,
            objectCenterY,
            objectHeight,
            "Y"
          );
          const line = {
            x: _.round(objectCenterX + objectWidth / 2),
            y1: point1,
            y2: point2,
            show: showText,
          };
          updateLinesArray(verticalLines, line);
        }
        const isRight = isInRange(
          objectCenterX + objectWidth / 2,
          activeObjectCenterX + activeObjectWidth / 2
        );
        const right = isRight ? "right" : "left";
        target.setPositionByOrigin(
          new fabric.Point(
            canvasObjects[i].id === "workarea"
              ? canvasWidth
              : _.round(objectCenterX + objectWidth / 2),
            activeObjectCenterY
          ),
          right,
          "center"
        );
      }

      // snap by the top edge
      if (
        isInRange(
          objectCenterY - objectHeight / 2,
          activeObjectCenterY - activeObjectHeight / 2
        ) ||
        isInRange(
          objectCenterY - objectHeight / 2,
          activeObjectCenterY + activeObjectHeight / 2
        )
      ) {
        horizontalInTheRange = true;
        if (canvasObjects[i].id === "workarea") {
          const line = {
            y: 0,
            x1: -2000,
            x2: 2000,
            show: false,
          };
          updateLinesArray(horizontalLines, line);
        } else {
          const { point1, point2, showText } = checkPosition(
            activeObjectCenterX,
            activeObjectWidth,
            objectCenterX,
            objectWidth,
            "X"
          );
          const line = {
            y: _.round(objectCenterY - objectHeight / 2),
            x1: point1,
            x2: point2,
            show: showText,
          };
          updateLinesArray(horizontalLines, line);
        }
        const isTop = isInRange(
          objectCenterY - objectHeight / 2,
          activeObjectCenterY - activeObjectHeight / 2
        );
        const top = isTop ? "top" : "bottom";
        target.setPositionByOrigin(
          new fabric.Point(
            activeObjectCenterX,
            canvasObjects[i].id === "workarea"
              ? 0
              : objectCenterY - objectHeight / 2
          ),
          "center",
          top
        );
      }

      // snap by the bottom edge
      if (
        isInRange(
          objectCenterY + objectHeight / 2,
          activeObjectCenterY + activeObjectHeight / 2
        ) ||
        isInRange(
          objectCenterY + objectHeight / 2,
          activeObjectCenterY - activeObjectHeight / 2
        )
      ) {
        horizontalInTheRange = true;
        if (canvasObjects[i].id === "workarea") {
          const line = {
            y: objectHeight - 2,
            x1: -2000,
            x2: 2000,
            show: false,
          };
          updateLinesArray(horizontalLines, line);
        } else {
          const { point1, point2, showText } = checkPosition(
            activeObjectCenterX,
            activeObjectWidth,
            objectCenterX,
            objectWidth,
            "X"
          );
          const line = {
            y: _.round(objectCenterY + objectHeight / 2),
            x1: point1,
            x2: point2,
            show: showText,
          };
          updateLinesArray(horizontalLines, line);
        }
        const isBottom = isInRange(
          objectCenterY + objectHeight / 2,
          activeObjectCenterY + activeObjectHeight / 2
        );
        const bottom = isBottom ? "bottom" : "top";
        target.setPositionByOrigin(
          new fabric.Point(
            activeObjectCenterX,
            canvasObjects[i].id === "workarea"
              ? canvasHeight
              : _.round(objectCenterY + objectHeight / 2)
          ),

          "center",
          bottom
        );
      }

      // snap by the horizontal center line
      if (isInRange(objectCenterX, activeObjectCenterX)) {
        verticalInTheRange = true;
        if (canvasObjects[i].id === "workarea") {
          const line = {
            x: canvasWidth / 2,
            y1: -2000,
            y2: 2000,
            show: false,
            centerLineX: "x",
          };
          updateLinesArray(verticalLines, line);
        } else {
          const { point1, point2, showText } = checkPosition(
            activeObjectCenterY,
            activeObjectHeight,
            objectCenterY,
            objectHeight,
            "Y"
          );
          const line = {
            x: objectCenterX,
            y1: point1,
            y2: point2,
            show: showText,
          };
          updateLinesArray(verticalLines, line);
        }
        if (!scaling)
          target.setPositionByOrigin(
            new fabric.Point(objectCenterX, activeObjectCenterY),
            "center",
            "center"
          );
      }

      // snap by the vertical center line
      if (isInRange(objectCenterY, activeObjectCenterY)) {
        horizontalInTheRange = true;
        if (canvasObjects[i].id === "workarea") {
          const line = {
            y: canvasHeight / 2,
            x1: -2000,
            x2: 2000,
            show: false,
            centerLineY: "y",
          };
          updateLinesArray(horizontalLines, line);
        } else {
          const { point1, point2, showText } = checkPosition(
            activeObjectCenterX,
            activeObjectWidth,
            objectCenterX,
            objectWidth,
            "X"
          );
          const line = {
            y: objectCenterY,
            x1: point1,
            x2: point2,
            show: showText,
          };
          updateLinesArray(horizontalLines, line);
        }
        if (!scaling)
          target.setPositionByOrigin(
            new fabric.Point(activeObjectCenterX, objectCenterY),
            "center",
            "center"
          );
      }
    }

    if (horizontalInTheRange && verticalInTheRange && !scaling) {
      if (isInRange(target.height, canvasHeight)) {
        target.setPositionByOrigin(
          new fabric.Point(activeObjectCenterX, canvasHeight / 2),
          "center",
          "center"
        );
      } else if (isInRange(target.width, canvasWidth)) {
        target.setPositionByOrigin(
          new fabric.Point(canvasWidth / 2, activeObjectCenterY),
          "center",
          "center"
        );
      } else {
        const intersections = findIntersections(
          verticalLines,
          horizontalLines,
          1,
          Math.max(activeObjectHeight, activeObjectWidth)
        );
        const { x, y } = getQuadrant(
          {
            x: intersections[0].x,
            y: intersections[0].y,
          },
          { x: target.getCenterPoint().x, y: target.getCenterPoint().y }
        );
        target.setPositionByOrigin(
          new fabric.Point(intersections[0].x, intersections[0].y),
          intersections[0].centerLineX == "x" ? "center" : x,
          intersections[0].centerLineY == "y" ? "center" : y
        );
      }
    }
    if (!horizontalInTheRange) {
      horizontalLines.length = 0;
    }

    if (!verticalInTheRange) {
      verticalLines.length = 0;
    }
  };

  return {
    movingGuidelines,
  };
};

export default useGuidelinesHandlers;
