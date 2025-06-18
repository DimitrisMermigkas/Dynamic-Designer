import React from "react";

const ButtonSvg = ({ fill }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 18.5C18 19.3 17.3 20 16.5 20H11C10.6 20 10.3 19.9 10 19.6L6 15.4L6.7 14.6C6.9 14.4 7.2 14.3 7.5 14.3H7.7L10 16V7C10 6.4 10.4 6 11 6C11.6 6 12 6.4 12 7V11.5L13.2 11.6L17.1 13.8C17.6 14 18 14.6 18 15.1V18.5ZM18 0H2C0.9 0 0 0.9 0 2V10C0 11.1 0.9 12 2 12H6V10H2V2H18V10H16V12H18C19.1 12 20 11.1 20 10V2C20 0.9 19.1 0 18 0Z"
      fill={ fill || "white" }
    />
  </svg>
);

export default ButtonSvg;
