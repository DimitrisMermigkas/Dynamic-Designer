import React from "react";
import { Shape } from "@client/schemas/schemaDesigner";
import { convertColor } from "../../utils/styleUtils";

type TriangleProps = { config: Shape };

const Triangle = ({ config }: TriangleProps) => {
  const width = config.width ?? 0;
  const height = config.height ?? 0;
  const strokeWidth = config.strokeWidth ?? 0;

  return (
    <div
      style={{
        position: "absolute",
        width: width,
        height: height,
        left: config.left,
        top: config.top,
        overflow: "visible",
        boxSizing: "border-box",
      }}
    >
      <svg
        height={height}
        width={width}
        viewBox={`0 ${-strokeWidth} ${width} ${height + 1.5 * strokeWidth}`}
      >
        <polygon
          points={`${width / 2},0 0,${height} ${width},${height}`}
          style={{
            fill: convertColor(config.fill),
            stroke: convertColor(config.stroke),
            strokeWidth: config.strokeWidth ?? undefined,
          }}
        />
      </svg>
    </div>
  );
};

export default Triangle;
