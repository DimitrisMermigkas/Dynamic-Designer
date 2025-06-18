import React from "react";

const TextSvg = ({ fill }) => (
  <svg
    width="19"
    height="17"
    viewBox="0 0 19 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 2V17H6V2H0V0H14V2H8ZM16 10V17H14V10H11V8H19V10H16Z"
      fill={ fill || "white" }
    />
  </svg>
);

export default TextSvg;
