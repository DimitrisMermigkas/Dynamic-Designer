import React from "react";

const LineSvg = ({ fill }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1.29297 20.293L20.293 1.29297"
      stroke={fill}
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
);

export default LineSvg;
