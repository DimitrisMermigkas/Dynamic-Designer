import React from "react";

const FullscreenSvg = ({ fill }) => (
  <svg
    width="20"
    height="18"
    viewBox="0 0 20 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M19.7071 0.292893C19.5196 0.105357 19.2652 0 19 0H1C0.734783 0 0.48043 0.105357 0.292893 0.292893C0.105357 0.48043 0 0.734783 0 1V17C0 17.2652 0.105357 17.5196 0.292893 17.7071C0.48043 17.8946 0.734783 18 1 18H19C19.2652 18 19.5196 17.8946 19.7071 17.7071C19.8946 17.5196 20 17.2652 20 17V1C20 0.734783 19.8946 0.48043 19.7071 0.292893ZM2 16V2H18V16H2Z"
      fill={ fill || "white" }
    />
  </svg>
);

export default FullscreenSvg;
