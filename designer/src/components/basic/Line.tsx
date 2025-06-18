import React from "react";
import { Line as LineSchema } from "@client/schemas/schemaDesigner";

type LineProps = { config: LineSchema };

const Line = ({ config }: LineProps) => {
  const angle = Math.atan2(config.height, config.width) * (180 / Math.PI);

  const length = Math.sqrt(
    config.width * config.width + config.height * config.height
  );

  return (
    <div
      style={{
        position: "absolute",
        left: `${config.left}px`,
        top: `${config.top}px`,
        width: `${length}px`,
        borderTop: `${config.strokeWidth}px solid ${config.stroke}`,
        transform: `rotate(${angle}deg)`, // Rotate the line to the correct angle
        transformOrigin: "0 0", // Pivot from the starting point
      }}
    />
  );
};

export default Line;
