import React from "react";

const PointerSvg = ({ fill, strokeWidth }) => (
  <svg
    width="17"
    height="22"
    viewBox="0 0 17 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.25 13.75H6.83579L6.54289 14.0429L1.5 19.0858V2.75331L13.6542 13.75H7.25Z"
      stroke={fill || "white"}
      stroke-width={strokeWidth || 2}
    />
  </svg>
);
export default PointerSvg;
