import React from "react";
import EmbedElementSvg from "../FabricComponents/images/EmbedElementSvg";

const EmbedTemp = ({ config }) => {
  const height = config?.height;
  const width = config?.width;
  const area = width * height; // Calculate the area of the rectangle
  const fontSize = Math.sqrt(area) * 0.05; // Scale font size based on area (adjust multiplier for desired effect)

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        width: width,
        height: height,
        border: "1px solid #000000ff",
        boxSizing: "border-box",
      }}
    >
      <div style={{ height: "100%", display: "flex", alignItems: "center" }}>
        <EmbedElementSvg /> {/* Replace with your actual SVG component */}
        <span style={{ marginLeft: "5px", fontSize: `${fontSize}px` }}>
          IFrame Object
        </span>
      </div>
    </div>
  );
};

export default EmbedTemp;
