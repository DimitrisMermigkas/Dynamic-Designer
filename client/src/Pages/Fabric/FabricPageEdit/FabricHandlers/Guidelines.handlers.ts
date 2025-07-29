import _ from "lodash";
import { useEffect, useMemo, useCallback, useState } from "react";
import { fabric } from "fabric";

const useGuidelinesHandlers = ({ canvas, screenResolution }) => {
  //   const viewportTransform = handler.viewportTransform.slice();
  const aligningLineMargin = 1;
  const aligningLineWidth = 1;
  const aligningLineColor = "rgb(255, 0, 0)";

  // Change from useRef to useState
  const [verticalLines, setVerticalLines] = useState([]);
  const [horizontalLines, setHorizontalLines] = useState([]);
  const [intersectionPoints, setIntersectionPoints] = useState([]);
  const markerSize = 6; // Size of the X marker in pixels

  const ctx = useMemo(() => {
    if (canvas) {
      return canvas.getContext("2d");
    }
  }, [canvas]);

  // Move drawLine outside useEffect to ensure it always has latest values
  const drawLine = useCallback(
    (x1, y1, x2, y2, calculations, alignmentType) => {
      if (!ctx || !canvas) return;

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

      if (calculations) {
        // Calculate the actual distance based on nearest corners from calculations
        const actualDistance = Math.abs(
          calculations.calculationCorner2 - calculations.calculationCorner1
        );

        // Convert the distance to screen resolution
        const dim = calculations.axis === "Y" ? "height" : "width";
        const length = Math.round(
          (actualDistance * screenResolution[dim]) / canvas[dim]
        );

        // Get all lines for this target object
        const currentLines =
          calculations.axis === "Y" ? verticalLines : horizontalLines;
        const linesForTarget = currentLines.filter(
          (l) => l.calculations?.targetId === calculations?.targetId
        );

        // Show text if:
        // 1. It's the only line for this target
        // 2. It's a center alignment
        // 3. If there are multiple lines but no center alignment, show text on all lines
        const shouldShowText =
          linesForTarget.length === 1 ||
          alignmentType === "center" ||
          linesForTarget.length !== 3;

        if (shouldShowText) {
          // Calculate the midpoint between nearest corners for text placement
          const midX =
            calculations.axis === "Y"
              ? x1 + 10 // For vertical lines, use the line's x position
              : (calculations.calculationCorner1 +
                  calculations.calculationCorner2) /
                2;

          const midY =
            calculations.axis === "Y"
              ? (calculations.calculationCorner1 +
                  calculations.calculationCorner2) /
                2 // For vertical lines, use midpoint of nearest corners
              : y1; // For horizontal lines, use the line's y position

          // Set the font properties for the length text
          const fontSize = 12;
          const fontFamily = "Arial";
          ctx.font = `${fontSize}px ${fontFamily}`;
          ctx.fillStyle = aligningLineColor;

          // Draw the length text at the midpoint between nearest corners
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
      }

      ctx.restore();
    },
    [ctx, canvas, screenResolution, verticalLines, horizontalLines]
  );

  // Move other drawing functions to useCallback as well
  const drawVerticalLine = useCallback(
    (coords) => {
      // coords: { x?: number; y1?: number; y2?: number }
      drawLine(
        coords.x + 0.1,
        coords.y1 > coords.y2 ? coords.y2 : coords.y1,
        coords.x + 0.1,
        coords.y2 > coords.y1 ? coords.y2 : coords.y1,
        coords.calculations,
        coords.alignmentType
      );
    },
    [drawLine]
  );

  const drawHorizontalLine = useCallback(
    (coords) => {
      // coords: { y?: number, x1?: number, x2?: number }
      drawLine(
        coords.x1 > coords.x2 ? coords.x2 : coords.x1,
        coords.y + 0.1,
        coords.x2 > coords.x1 ? coords.x2 : coords.x1,
        coords.y + 0.1,
        coords.calculations,
        coords.alignmentType
      );
    },
    [drawLine]
  );

  // Function to draw an X marker at intersection points
  const drawXMarker = useCallback(
    (point) => {
      if (!ctx) return;

      const x =
        point.x * canvas.scrollingZoom * canvas.viewportZoom +
        canvas.viewportTransform[4];
      const y =
        point.y * canvas.scrollingZoom * canvas.viewportZoom +
        canvas.viewportTransform[5];
      const size = markerSize / 2;

      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = aligningLineColor;

      // Draw the X
      ctx.beginPath();
      ctx.moveTo(x - size, y - size);
      ctx.lineTo(x + size, y + size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + size, y - size);
      ctx.lineTo(x - size, y + size);
      ctx.stroke();

      ctx.restore();
    },
    [ctx, canvas]
  );

  const isInRange = useCallback((v1, v2) => {
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
  }, []);

  // Function to find the corners of an object
  const getObjectCorners = useCallback((obj) => {
    if (!obj || obj.id === "workarea") return [];

    const width = obj.width * obj.scaleX;
    const height = obj.height * obj.scaleY;
    const center = obj.getCenterPoint();
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // Calculate the four corners
    return [
      { x: center.x - halfWidth, y: center.y - halfHeight }, // top-left
      { x: center.x + halfWidth, y: center.y - halfHeight }, // top-right
      { x: center.x + halfWidth, y: center.y + halfHeight }, // bottom-right
      { x: center.x - halfWidth, y: center.y + halfHeight }, // bottom-left
    ];
  }, []);

  useEffect(() => {
    if (canvas) {
      // Store the render handler function so we can remove it later
      const renderHandler = () => {
        // Draw vertical lines
        for (let i = verticalLines.length; i--; ) {
          const line = verticalLines[i];
          drawVerticalLine(line);
        }

        // Draw horizontal lines
        for (let i = horizontalLines.length; i--; ) {
          const line = horizontalLines[i];
          drawHorizontalLine(line);
        }

        // Filter out duplicate intersection points before drawing
        const uniqueIntersectionPoints = intersectionPoints.filter(
          (point, index) => {
            // Check if this point is the first occurrence of its coordinates
            return (
              intersectionPoints.findIndex(
                (p) =>
                  Math.abs(p.x - point.x) < 1 && Math.abs(p.y - point.y) < 1
              ) === index
            );
          }
        );

        // Draw X markers at unique intersection points only
        for (let i = uniqueIntersectionPoints.length; i--; ) {
          drawXMarker(uniqueIntersectionPoints[i]);
        }
      };

      // Store the mouse up handler
      const mouseUpHandler = () => {
        const activeObject = canvas.getActiveObject();
        if (activeObject && !activeObject.isPoint) {
          // Check if we have any guidelines drawn
          // Filter out canvas lines
          const filteredVerticalLines = verticalLines.filter(
            (line) => !line?.isCanvas
          );
          const filteredHorizontalLines = horizontalLines.filter(
            (line) => !line?.isCanvas
          );
          if (
            filteredVerticalLines.length > 0 ||
            filteredHorizontalLines.length > 0
          ) {
            // Get active object bounds
            const activeObjectBounds = activeObject.getBoundingRect(true, true);
            const activeObjectCenter = activeObject.getCenterPoint();

            // Get active object middle left, middle right, middle top, middle bottom
            const activeObjectMiddleLeft = {
              x: activeObjectCenter.x - activeObjectBounds.width / 2,
              y: activeObjectCenter.y,
            };
            const activeObjectMiddleRight = {
              x: activeObjectCenter.x + activeObjectBounds.width / 2,
              y: activeObjectCenter.y,
            };
            const activeObjectMiddleTop = {
              x: activeObjectCenter.x,
              y: activeObjectCenter.y - activeObjectBounds.height / 2,
            };
            const activeObjectMiddleBottom = {
              x: activeObjectCenter.x,
              y: activeObjectCenter.y + activeObjectBounds.height / 2,
            };

            // Case 1: Only one type of lines exists
            if (
              filteredVerticalLines.length > 0 !==
              filteredHorizontalLines.length > 0
            ) {
              // Get the single line array that exists
              const lines =
                filteredVerticalLines.length > 0
                  ? filteredVerticalLines
                  : filteredHorizontalLines;
              const isVertical = verticalLines.length > 0;

              // Calculate object edges
              const objectEdges = isVertical
                ? {
                    left: activeObjectBounds.left,
                    right: activeObjectBounds.left + activeObjectBounds.width,
                    center: activeObjectCenter.x,
                    middleLeft: activeObjectMiddleLeft.x,
                    middleRight: activeObjectMiddleRight.x,
                    middleTop: activeObjectMiddleTop.y,
                    middleBottom: activeObjectMiddleBottom.y,
                  }
                : {
                    top: activeObjectBounds.top,
                    bottom: activeObjectBounds.top + activeObjectBounds.height,
                    center: activeObjectCenter.y,
                    middleLeft: activeObjectMiddleLeft.x,
                    middleRight: activeObjectMiddleRight.x,
                    middleTop: activeObjectMiddleTop.y,
                    middleBottom: activeObjectMiddleBottom.y,
                  };

              // Find the nearest line and its distance to each edge
              let nearestLine = null;
              let nearestEdge = null;
              let minDistance = Infinity;

              lines.forEach((line) => {
                const lineValue = isVertical ? line.x : line.y;

                // Check distance to each edge
                Object.entries(objectEdges).forEach(([edge, value]) => {
                  const distance = Math.abs(lineValue - value);
                  if (distance < minDistance) {
                    minDistance = distance;
                    nearestLine = line;
                    nearestEdge = edge;
                  }
                });
              });

              if (nearestLine && nearestEdge) {
                // For vertical lines
                if (isVertical) {
                  activeObject.setPositionByOrigin(
                    new fabric.Point(nearestLine.x, activeObjectCenter.y),
                    nearestEdge === "right"
                      ? "right"
                      : nearestEdge === "left"
                      ? "left"
                      : "center",
                    "center"
                  );
                }
                // For horizontal lines
                else {
                  activeObject.setPositionByOrigin(
                    new fabric.Point(activeObjectCenter.x, nearestLine.y),
                    "center",
                    nearestEdge === "bottom"
                      ? "bottom"
                      : nearestEdge === "top"
                      ? "top"
                      : "center"
                  );
                }
              }
            }
            // Case 2: Both types of lines exist - find intersection
            else if (
              filteredVerticalLines.length > 0 &&
              filteredHorizontalLines.length > 0
            ) {
              if (intersectionPoints.length > 0) {
                const intersectionPointsWithMiddle = [
                  ...intersectionPoints,
                  activeObjectMiddleLeft,
                  activeObjectMiddleRight,
                  activeObjectMiddleTop,
                  activeObjectMiddleBottom,
                ];
                // Find clustered intersection points (within margin of 2)
                const clusters = [];
                const used = new Set();
                const margin = 2;

                intersectionPointsWithMiddle.forEach((point, index) => {
                  if (used.has(index)) return;

                  const cluster = [point];
                  used.add(index);

                  // Find other points within margin
                  intersectionPointsWithMiddle.forEach(
                    (otherPoint, otherIndex) => {
                      if (otherIndex === index || used.has(otherIndex)) return;

                      const xDiff = Math.abs(point.x - otherPoint.x);
                      const yDiff = Math.abs(point.y - otherPoint.y);

                      if (xDiff <= margin && yDiff <= margin) {
                        cluster.push(otherPoint);
                        used.add(otherIndex);
                      }
                    }
                  );

                  if (cluster.length > 1) {
                    clusters.push(cluster);
                  }
                });

                // If we found clusters, process them
                if (clusters.length > 0) {
                  console.log("Found clustered intersection points:", clusters);

                  // Filter out canvas lines
                  const filteredLines = [
                    ...filteredVerticalLines,
                    ...filteredHorizontalLines,
                  ];

                  // Find the cluster that's closest to any actual guideline
                  let bestCluster = null;
                  let minClusterDistance = Infinity;

                  clusters.forEach((cluster) => {
                    // For each cluster, find the minimum distance to any line
                    let clusterMinDistance = Infinity;

                    cluster.forEach((point) => {
                      filteredLines.forEach((line) => {
                        const lineValue =
                          line.x !== undefined ? line.x : line.y;
                        const pointValue =
                          line.x !== undefined ? point.x : point.y;
                        const distanceToLine = Math.abs(lineValue - pointValue);

                        if (distanceToLine < clusterMinDistance) {
                          clusterMinDistance = distanceToLine;
                        }
                      });
                    });

                    // If this cluster is closer to a line than previous clusters
                    if (clusterMinDistance < minClusterDistance) {
                      minClusterDistance = clusterMinDistance;
                      bestCluster = cluster;
                    }
                  });

                  if (bestCluster) {
                    console.log("Best cluster selected:", bestCluster);

                    // Get active object corners and middle points
                    const activeObjectCorners = getObjectCorners(activeObject);
                    const activeObjectPositions = [
                      {
                        corner: activeObjectCorners[0],
                        origin: { x: "left", y: "top" },
                      }, // top-left
                      {
                        corner: activeObjectMiddleLeft,
                        origin: { x: "left", y: "center" },
                      }, // middle-left
                      {
                        corner: activeObjectMiddleRight,
                        origin: { x: "right", y: "center" },
                      }, // middle-right
                      {
                        corner: activeObjectCorners[1],
                        origin: { x: "right", y: "top" },
                      }, // top-right
                      {
                        corner: activeObjectMiddleBottom,
                        origin: { x: "center", y: "bottom" },
                      }, // middle-bottom
                      {
                        corner: activeObjectCorners[2],
                        origin: { x: "right", y: "bottom" },
                      }, // bottom-right
                      {
                        corner: activeObjectMiddleTop,
                        origin: { x: "center", y: "top" },
                      }, // middle-top
                      {
                        corner: activeObjectCorners[3],
                        origin: { x: "left", y: "bottom" },
                      }, // bottom-left
                      {
                        corner: activeObjectCenter,
                        origin: { x: "center", y: "center" },
                      }, // center
                    ];

                    // Find the point in the best cluster that's closest to any corner
                    let bestMatch = null;
                    let minDistance = Infinity;

                    bestCluster.forEach((point) => {
                      activeObjectPositions.forEach(({ corner, origin }) => {
                        const distance = Math.sqrt(
                          Math.pow(point.x - corner.x, 2) +
                            Math.pow(point.y - corner.y, 2)
                        );

                        if (distance < minDistance) {
                          minDistance = distance;
                          bestMatch = {
                            point: point,
                            origin: origin,
                            cluster: bestCluster,
                          };
                        }
                      });
                    });

                    if (bestMatch) {
                      console.log("Best match found:", bestMatch);

                      // Snap to the best matching intersection point
                      activeObject.setPositionByOrigin(
                        new fabric.Point(bestMatch.point.x, bestMatch.point.y),
                        bestMatch.origin.x,
                        bestMatch.origin.y
                      );
                    }
                  }
                } else {
                  // No clusters found, use the first intersection point as fallback
                  const intersection = intersectionPoints[0];

                  activeObject.setPositionByOrigin(
                    new fabric.Point(intersection.x, intersection.y),
                    "center",
                    "center"
                  );
                }
              }
            }

            canvas.renderAll();
          }
        }

        // Clear all guidelines
        setVerticalLines([]);
        setHorizontalLines([]);
        setIntersectionPoints([]);
      };

      // Add event listeners
      canvas.on("after:render", renderHandler);
      canvas.on("mouse:up", mouseUpHandler);

      // Cleanup function to remove event listeners
      return () => {
        canvas.off("after:render", renderHandler);
        canvas.off("mouse:up", mouseUpHandler);
      };
    }
  }, [
    canvas,
    drawVerticalLine,
    drawHorizontalLine,
    drawXMarker,
    verticalLines,
    horizontalLines,
    intersectionPoints,
    getObjectCorners,
  ]);

  // Function to check if a point is on a line
  const isPointOnLine = useCallback((point, line, threshold = 1) => {
    if (line.x !== undefined) {
      // Vertical line
      return Math.abs(point.x - line.x) <= threshold;
    } else if (line.y !== undefined) {
      // Horizontal line
      return Math.abs(point.y - line.y) <= threshold;
    }
    return false;
  }, []);

  // Update addIntersectionPoint to work with state
  const addIntersectionPoint = useCallback((point) => {
    setIntersectionPoints((prevPoints) => {
      // Always add the point to the array for clustering logic
      return [...prevPoints, point];
    });
  }, []);

  // Generic function to calculate nearest and farthest corners for alignment
  const calculateAlignmentCorners = useCallback(
    (
      activeObject,
      targetObject,
      axis,
      alignmentValue,
      activeObjectCenter,
      activeObjectBoundingRect,
      targetObjectCenter,
      targetObjectBoundingRect,
      isCenter = false
    ) => {
      const activeObjectCorners = getObjectCorners(activeObject);
      const targetObjectCorners = getObjectCorners(targetObject);

      // Extract the relevant coordinate based on axis (x for horizontal, y for vertical)
      const coordinate = axis === "Y" ? "y" : "x";

      const sortedActiveObjectCorners = activeObjectCorners
        .map((corner) => corner[coordinate])
        .sort((a, b) => a - b);
      const sortedTargetObjectCorners = targetObjectCorners
        .map((corner) => corner[coordinate])
        .sort((a, b) => a - b);

      // Get the center coordinate of the active object
      const activeObjectCenterCoordinate =
        activeObjectCenter[coordinate.toLowerCase()];

      // Determine the position of active object center relative to target object
      let position;
      if (activeObjectCenterCoordinate < sortedTargetObjectCorners[0]) {
        position = "before"; // Active object center is before the target object
      } else if (
        activeObjectCenterCoordinate >
        sortedTargetObjectCorners[sortedTargetObjectCorners.length - 1]
      ) {
        position = "after"; // Active object center is after the target object
      } else {
        position = "inside"; // Active object center is inside the target object range
      }

      // Get target object center coordinate
      const targetObjectCenterCoordinate =
        targetObjectCenter[coordinate.toLowerCase()];

      let activeObjectFarthestCorner, targetObjectFarthestCorner;
      let activeObjectNearestCorner, targetObjectNearestCorner;

      // Calculate farthest corner based on distance from target center
      const activeObjectFarthestFromTarget = sortedActiveObjectCorners.reduce(
        (farthest, current) => {
          const currentDistance = Math.abs(
            current - targetObjectCenterCoordinate
          );
          const farthestDistance = Math.abs(
            farthest - targetObjectCenterCoordinate
          );
          return currentDistance > farthestDistance ? current : farthest;
        }
      );

      // Calculate nearest corner based on distance from target center
      const activeObjectNearestToTarget = sortedActiveObjectCorners.reduce(
        (nearest, current) => {
          const currentDistance = Math.abs(
            current - targetObjectCenterCoordinate
          );
          const nearestDistance = Math.abs(
            nearest - targetObjectCenterCoordinate
          );
          return currentDistance < nearestDistance ? current : nearest;
        }
      );

      // Calculate target object's farthest and nearest corners relative to active object center
      const targetObjectFarthestFromActive = sortedTargetObjectCorners.reduce(
        (farthest, current) => {
          const currentDistance = Math.abs(
            current - activeObjectCenterCoordinate
          );
          const farthestDistance = Math.abs(
            farthest - activeObjectCenterCoordinate
          );
          return currentDistance > farthestDistance ? current : farthest;
        }
      );

      const targetObjectNearestToActive = sortedTargetObjectCorners.reduce(
        (nearest, current) => {
          const currentDistance = Math.abs(
            current - activeObjectCenterCoordinate
          );
          const nearestDistance = Math.abs(
            nearest - activeObjectCenterCoordinate
          );
          return currentDistance < nearestDistance ? current : nearest;
        }
      );

      switch (position) {
        case "before":
        case "after":
          // For non-overlapping cases, use the calculated farthest/nearest corners
          activeObjectFarthestCorner = activeObjectFarthestFromTarget;
          targetObjectFarthestCorner = targetObjectFarthestFromActive;
          activeObjectNearestCorner = activeObjectNearestToTarget;
          targetObjectNearestCorner = targetObjectNearestToActive;
          break;

        case "inside":
          // Active object center is inside target object range
          // For drawing guidelines, use the farthest corners for maximum visibility
          activeObjectFarthestCorner = activeObjectFarthestFromTarget;
          targetObjectFarthestCorner = targetObjectFarthestFromActive;

          // For distance calculation, use the nearest edges
          activeObjectNearestCorner = activeObjectNearestToTarget;
          targetObjectNearestCorner = targetObjectNearestToActive;
          break;
      }

      // Add intersection points (X markers) for the alignment
      if (axis === "Y") {
        // For vertical lines, add points at the target object's corners
        const targetObjectHeight = _.round(
          targetObjectBoundingRect.height /
            (canvas.viewportZoom * canvas.scrollingZoom)
        );

        const cornerY1 = targetObjectCenter.y - targetObjectHeight / 2; // Top corner
        const cornerY2 = targetObjectCenter.y + targetObjectHeight / 2; // Bottom corner

        addIntersectionPoint({
          x: alignmentValue,
          y: cornerY1,
        });

        addIntersectionPoint({
          x: alignmentValue,
          y: cornerY2,
        });

        // If this is a center line, add intersection at active object's center
        if (isCenter) {
          addIntersectionPoint({
            x: alignmentValue,
            y: activeObjectCenter.y,
          });
        } else {
          // Add X markers at the corners of the active object
          const activeObjectHeight = _.round(
            activeObjectBoundingRect.height /
              (canvas.viewportZoom * canvas.scrollingZoom)
          );

          addIntersectionPoint({
            x: alignmentValue,
            y: activeObjectCenter.y + activeObjectHeight / 2,
          });
          addIntersectionPoint({
            x: alignmentValue,
            y: activeObjectCenter.y - activeObjectHeight / 2,
          });
        }
      } else {
        // For horizontal lines, add points at the target object's corners
        const targetObjectWidth = _.round(
          targetObjectBoundingRect.width /
            (canvas.viewportZoom * canvas.scrollingZoom)
        );

        const cornerX1 = targetObjectCenter.x - targetObjectWidth / 2; // Left corner
        const cornerX2 = targetObjectCenter.x + targetObjectWidth / 2; // Right corner

        addIntersectionPoint({
          x: cornerX1,
          y: alignmentValue,
        });

        addIntersectionPoint({
          x: cornerX2,
          y: alignmentValue,
        });

        // If this is a center line, add intersection at active object's center
        if (isCenter) {
          addIntersectionPoint({
            x: activeObjectCenter.x,
            y: alignmentValue,
          });
        } else {
          // Add X markers at the corners of the active object
          const activeObjectWidth = _.round(
            activeObjectBoundingRect.width /
              (canvas.viewportZoom * canvas.scrollingZoom)
          );

          addIntersectionPoint({
            x: activeObjectCenter.x + activeObjectWidth / 2,
            y: alignmentValue,
          });
          addIntersectionPoint({
            x: activeObjectCenter.x - activeObjectWidth / 2,
            y: alignmentValue,
          });
        }
      }

      return {
        // For drawing the guidelines
        activeObjectFarthestCorner,
        targetObjectFarthestCorner,
        // For calculating the distance
        activeObjectNearestCorner,
        targetObjectNearestCorner,
        // Additional info about positioning
        position,
      };
    },
    [canvas, getObjectCorners, addIntersectionPoint]
  );

  // Update updateLinesArray to work with state
  const updateLinesArray = useCallback((linesArray, line, setLinesArray) => {
    setLinesArray((prevLines) => {
      const newLinesArray = [...prevLines];

      // Check if a line with the same coordinates and alignmentType already exists
      const existingIndex = newLinesArray.findIndex((existingLine) => {
        // For vertical lines (have x property)
        if (line.x !== undefined) {
          return (
            existingLine.x === line.x &&
            existingLine.alignmentType === line.alignmentType &&
            existingLine.calculations?.targetId === line.calculations?.targetId
          );
        }
        // For horizontal lines (have y property)
        else if (line.y !== undefined) {
          return (
            existingLine.y === line.y &&
            existingLine.alignmentType === line.alignmentType &&
            existingLine.calculations?.targetId === line.calculations?.targetId
          );
        }
        return false;
      });

      if (existingIndex >= 0) {
        // Update existing line
        newLinesArray[existingIndex] = {
          ...newLinesArray[existingIndex],
          ...line,
        };
      } else {
        // Add new line
        newLinesArray.push(line);
      }

      return newLinesArray;
    });
  }, []);

  // Function to extend a line to find all intersections with object corners
  const extendLineToCorners = useCallback(
    (line, objects, activeObject) => {
      // Skip if no line or it's a canvas line
      if (!line || line.isCanvas) return;

      objects.forEach((obj) => {
        if (obj === activeObject || obj.id === "workarea") return;

        const corners = getObjectCorners(obj);
        corners.forEach((corner) => {
          if (isPointOnLine(corner, line)) {
            addIntersectionPoint(corner);
          }
        });
      });
    },
    [getObjectCorners, isPointOnLine, addIntersectionPoint]
  );

  // Update movingGuidelines to use setState instead of .current
  const movingGuidelines = useCallback(
    (target, scaling) => {
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

      // Clear previous intersection points
      setIntersectionPoints([]);

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
          canvasObjects[i].id === "workarea"
            ? { x: canvasWidth / 2, y: canvasHeight / 2 }
            : canvasObjects[i].getCenterPoint();
        const objectCenterX = _.round(objectCenter.x);
        const objectCenterY = _.round(objectCenter.y);
        const objectBoundingRect =
          canvasObjects[i].id === "workarea"
            ? {
                height: canvasHeight * canvas.viewportTransform[3],
                width: canvasWidth * canvas.viewportTransform[0],
              }
            : canvasObjects[i].getBoundingRect();
        const objectHeight = _.round(
          objectBoundingRect.height /
            (canvas.viewportZoom * canvas.scrollingZoom)
        );
        const objectWidth = _.round(
          objectBoundingRect.width /
            (canvas.viewportZoom * canvas.scrollingZoom)
        );

        // Handle canvas (workarea) snapping
        if (canvasObjects[i].id === "workarea") {
          // #endregion
          // #region left edge of Canvas
          // snap to left edge of canvas
          if (isInRange(0, activeObjectCenterX - activeObjectWidth / 2)) {
            verticalInTheRange = true;
            const line = {
              x: 0,
              y1: -2000,
              y2: 2000,
              isCanvas: true,
            };
            updateLinesArray(verticalLines, line, setVerticalLines);

            target.setPositionByOrigin(
              new fabric.Point(0, activeObjectCenterY),
              "left",
              "center"
            );
          }
          // #endregion

          // #region right edge of Canvas
          // snap to right edge of canvas
          if (
            isInRange(canvasWidth, activeObjectCenterX + activeObjectWidth / 2)
          ) {
            verticalInTheRange = true;
            const line = {
              x: canvasWidth - 1,
              y1: -2000,
              y2: 2000,
              isCanvas: true,
            };
            updateLinesArray(verticalLines, line, setVerticalLines);

            target.setPositionByOrigin(
              new fabric.Point(canvasWidth, activeObjectCenterY),
              "right",
              "center"
            );
          }
          // #endregion

          // #region top edge of Canvas
          // snap to top edge of canvas
          if (isInRange(0, activeObjectCenterY - activeObjectHeight / 2)) {
            horizontalInTheRange = true;
            const line = {
              y: 0,
              x1: -2000,
              x2: 2000,
              isCanvas: true,
            };
            updateLinesArray(horizontalLines, line, setHorizontalLines);

            target.setPositionByOrigin(
              new fabric.Point(activeObjectCenterX, 0),
              "center",
              "top"
            );
          }
          // #endregion

          // #region bottom edge of Canvas
          // snap to bottom edge of canvas
          if (
            isInRange(
              canvasHeight,
              activeObjectCenterY + activeObjectHeight / 2
            )
          ) {
            horizontalInTheRange = true;
            const line = {
              y: objectHeight - 2,
              x1: -2000,
              x2: 2000,
              isCanvas: true,
            };
            updateLinesArray(horizontalLines, line, setHorizontalLines);

            target.setPositionByOrigin(
              new fabric.Point(activeObjectCenterX, canvasHeight),
              "center",
              "bottom"
            );
          }
          // #endregion

          // #region vertical center of Canvas
          // snap to vertical center line of canvas
          if (isInRange(objectCenterX, activeObjectCenterX)) {
            verticalInTheRange = true;
            const line = {
              x: canvasWidth / 2,
              y1: -2000,
              y2: 2000,
              centerLineX: "x",
              isCanvas: true,
            };
            addIntersectionPoint({
              x: canvasWidth / 2,
              y: activeObjectCenterY - activeObjectHeight / 2,
            });
            addIntersectionPoint({
              x: canvasWidth / 2,
              y: activeObjectCenterY + activeObjectHeight / 2,
            });
            updateLinesArray(verticalLines, line, setVerticalLines);

            if (!scaling)
              target.setPositionByOrigin(
                new fabric.Point(objectCenterX, activeObjectCenterY),
                "center",
                "center"
              );
          }
          // #endregion

          // #region horizontal center of Canvas
          // snap to horizontal center line of canvas
          if (isInRange(objectCenterY, activeObjectCenterY)) {
            horizontalInTheRange = true;
            const line = {
              y: canvasHeight / 2,
              x1: -2000,
              x2: 2000,
              centerLineY: "y",
              isCanvas: true,
            };
            addIntersectionPoint({
              x: activeObjectCenterX - activeObjectWidth / 2,
              y: canvasHeight / 2,
            });
            addIntersectionPoint({
              x: activeObjectCenterX + activeObjectWidth / 2,
              y: canvasHeight / 2,
            });
            updateLinesArray(horizontalLines, line, setHorizontalLines);

            if (!scaling)
              target.setPositionByOrigin(
                new fabric.Point(activeObjectCenterX, objectCenterY),
                "center",
                "center"
              );
          }
          // #endregion
        } else {
          // Show guidelines for other objects without snapping

          // #region left edge guidelines
          // left edge guidelines
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

            // Use the generic function to calculate alignment corners
            const {
              activeObjectFarthestCorner,
              targetObjectFarthestCorner,
              activeObjectNearestCorner,
              targetObjectNearestCorner,
            } = calculateAlignmentCorners(
              target,
              canvasObjects[i],
              "Y",
              _.round(objectCenterX - objectWidth / 2),
              activeObjectCenter,
              activeObjectBoundingRect,
              objectCenter,
              objectBoundingRect
            );

            const sortDistances = [
              activeObjectFarthestCorner,
              targetObjectFarthestCorner,
              activeObjectNearestCorner,
              targetObjectNearestCorner,
            ];
            sortDistances.sort((a, b) => a - b);
            const y1 = sortDistances[0];
            const y2 = sortDistances[3];
            const line = {
              x: _.round(objectCenterX - objectWidth / 2),
              y1: y1,
              y2: y2,
              calculations: {
                calculationCorner1: activeObjectNearestCorner,
                calculationCorner2: targetObjectNearestCorner,
                axis: "Y",
                targetId: canvasObjects[i].id || `obj_${i}`, // Add targetId
              },
              alignmentType: "left",
            };
            updateLinesArray(verticalLines, line, setVerticalLines);
          }
          // #endregion

          // #region right edge guidelines
          // right edge guidelines
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

            // Use the generic function to calculate alignment corners
            const {
              activeObjectFarthestCorner,
              targetObjectFarthestCorner,
              activeObjectNearestCorner,
              targetObjectNearestCorner,
            } = calculateAlignmentCorners(
              target,
              canvasObjects[i],
              "Y",
              _.round(objectCenterX + objectWidth / 2),
              activeObjectCenter,
              activeObjectBoundingRect,
              objectCenter,
              objectBoundingRect
            );

            const sortDistances = [
              activeObjectFarthestCorner,
              targetObjectFarthestCorner,
              activeObjectNearestCorner,
              targetObjectNearestCorner,
            ];
            sortDistances.sort((a, b) => a - b);
            const y1 = sortDistances[0];
            const y2 = sortDistances[3];

            const line = {
              x: _.round(objectCenterX + objectWidth / 2),
              y1: y1,
              y2: y2,
              calculations: {
                calculationCorner1: activeObjectNearestCorner,
                calculationCorner2: targetObjectNearestCorner,
                axis: "Y",
                targetId: canvasObjects[i].id || `obj_${i}`, // Add targetId
              },
              alignmentType: "right",
            };
            updateLinesArray(verticalLines, line, setVerticalLines);
          }
          // #endregion

          // #region top edge guidelines
          // top edge guidelines
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

            // Use the generic function to calculate alignment corners
            const {
              activeObjectFarthestCorner,
              targetObjectFarthestCorner,
              activeObjectNearestCorner,
              targetObjectNearestCorner,
            } = calculateAlignmentCorners(
              target,
              canvasObjects[i],
              "X",
              _.round(objectCenterY - objectHeight / 2),
              activeObjectCenter,
              activeObjectBoundingRect,
              objectCenter,
              objectBoundingRect
            );

            const sortDistances = [
              activeObjectFarthestCorner,
              targetObjectFarthestCorner,
              activeObjectNearestCorner,
              targetObjectNearestCorner,
            ];
            sortDistances.sort((a, b) => a - b);
            const x1 = sortDistances[0];
            const x2 = sortDistances[3];

            const line = {
              y: _.round(objectCenterY - objectHeight / 2),
              x1: x1,
              x2: x2,
              calculations: {
                calculationCorner1: activeObjectNearestCorner,
                calculationCorner2: targetObjectNearestCorner,
                axis: "X",
                targetId: canvasObjects[i].id || `obj_${i}`, // Add targetId
              },
              alignmentType: "top",
            };
            updateLinesArray(horizontalLines, line, setHorizontalLines);
          }
          // #endregion

          // #region bottom edge guidelines
          // bottom edge guidelines
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

            // Use the generic function to calculate alignment corners
            const {
              activeObjectFarthestCorner,
              targetObjectFarthestCorner,
              activeObjectNearestCorner,
              targetObjectNearestCorner,
            } = calculateAlignmentCorners(
              target,
              canvasObjects[i],
              "X",
              _.round(objectCenterY + objectHeight / 2),
              activeObjectCenter,
              activeObjectBoundingRect,
              objectCenter,
              objectBoundingRect
            );

            const sortDistances = [
              activeObjectFarthestCorner,
              targetObjectFarthestCorner,
              activeObjectNearestCorner,
              targetObjectNearestCorner,
            ];
            sortDistances.sort((a, b) => a - b);
            const x1 = sortDistances[0];
            const x2 = sortDistances[3];

            const line = {
              y: _.round(objectCenterY + objectHeight / 2),
              x1: x1,
              x2: x2,
              calculations: {
                calculationCorner1: activeObjectNearestCorner,
                calculationCorner2: targetObjectNearestCorner,
                axis: "X",
                targetId: canvasObjects[i].id || `obj_${i}`, // Add targetId
              },
              alignmentType: "bottom",
            };
            updateLinesArray(horizontalLines, line, setHorizontalLines);
          }
          // #endregion

          // #region horizontal center guidelines
          // horizontal center line guidelines
          if (isInRange(objectCenterX, activeObjectCenterX)) {
            verticalInTheRange = true;
            const {
              activeObjectFarthestCorner,
              targetObjectFarthestCorner,
              activeObjectNearestCorner,
              targetObjectNearestCorner,
            } = calculateAlignmentCorners(
              target,
              canvasObjects[i],
              "Y",
              objectCenterX,
              activeObjectCenter,
              activeObjectBoundingRect,
              objectCenter,
              objectBoundingRect,
              true // This is a center line
            );
            const sortDistances = [
              activeObjectCenterY,
              targetObjectFarthestCorner,
              targetObjectNearestCorner,
            ];
            sortDistances.sort((a, b) => a - b);
            const y1 = sortDistances[0];
            const y2 = sortDistances[2];
            const line = {
              x: objectCenterX,
              y1: y1,
              y2: y2,
              calculations: {
                calculationCorner1: activeObjectNearestCorner,
                calculationCorner2: targetObjectNearestCorner,
                axis: "Y",
                targetId: canvasObjects[i].id || `obj_${i}`, // Add targetId
              },
              alignmentType: "center",
            };
            updateLinesArray(verticalLines, line, setVerticalLines);
          }
          // #endregion

          // #region vertical center guidelines
          // vertical center line guidelines
          if (isInRange(objectCenterY, activeObjectCenterY)) {
            horizontalInTheRange = true;
            const {
              activeObjectFarthestCorner,
              targetObjectFarthestCorner,
              activeObjectNearestCorner,
              targetObjectNearestCorner,
            } = calculateAlignmentCorners(
              target,
              canvasObjects[i],
              "X",
              objectCenterY,
              activeObjectCenter,
              activeObjectBoundingRect,
              objectCenter,
              objectBoundingRect,
              true // This is a center line
            );
            const sortDistances = [
              activeObjectCenterX,
              targetObjectFarthestCorner,
              targetObjectNearestCorner,
            ];
            sortDistances.sort((a, b) => a - b);
            const x1 = sortDistances[0];
            const x2 = sortDistances[2];
            const line = {
              y: objectCenterY,
              x1: x1,
              x2: x2,
              calculations: {
                calculationCorner1: activeObjectNearestCorner,
                calculationCorner2: targetObjectNearestCorner,
                axis: "X",
                targetId: canvasObjects[i].id || `obj_${i}`, // Add targetId
              },
              alignmentType: "center",
            };
            updateLinesArray(horizontalLines, line, setHorizontalLines);
          }
          // #endregion
        }
      }

      // Extend lines to find all intersections with object corners
      verticalLines.forEach((line) =>
        extendLineToCorners(line, canvasObjects, target)
      );
      horizontalLines.forEach((line) =>
        extendLineToCorners(line, canvasObjects, target)
      );

      if (!horizontalInTheRange) {
        setHorizontalLines([]);
      }

      if (!verticalInTheRange) {
        setVerticalLines([]);
      }
    },
    [canvas, isInRange, calculateAlignmentCorners, updateLinesArray]
  );

  return {
    movingGuidelines,
  };
};

export default useGuidelinesHandlers;
