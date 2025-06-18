import React from "react";

type PlaylistIconSvgProps = {
  fill?: string;
  width?: string | number;
  height?: string | number;
};

const PlaylistIconSvg = ({ fill, width, height }: PlaylistIconSvgProps) => (
  <svg
    width={width || "21"}
    height={height || "21"}
    viewBox="0 0 21 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19.25 15.75V17.5H1.75V15.75H19.25ZM1.75 3.0625L8.75 7.4375L1.75 11.8125V3.0625ZM19.25 9.625V11.375H10.5V9.625H19.25ZM3.5 6.22038V8.6555L5.44775 7.4375L3.5 6.22038ZM19.25 3.5V5.25H10.5V3.5H19.25Z"
      fill={fill}
    />
  </svg>
);

export default PlaylistIconSvg;
