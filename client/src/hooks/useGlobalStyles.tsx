import React from "react";
import { GlobalStyles as MuiGlobalStyles } from "@mui/material";
import { createTheme, useTheme } from "@mui/material/styles";
import themeDefault from "../theme-default";

const GlobalStyles = () => {
  const theme = createTheme(themeDefault("dark", "ltr"));
  return (
    <MuiGlobalStyles
      styles={{
        "html, body, #app, #app>div": {
          height: "100%",
        },
        body: {
          overflow: "hidden",
          background: `${theme.palette.background.defaultDarkest} !important`,
          position: "fixed",
          width: "100%",
        },
        "body, h1, h2, h3, h4, h5, h6": {
          fontSize: "13px",
          margin: 0,
          lineHeight: "20px",
          fontFamily: "Poppins, Inter, sans-serif",
        },
        "*::-webkit-scrollbar": {
          width: theme?.scrollBar?.width || "8px",
          height: theme?.scrollBar?.width || "8px",
        },
        "*::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "*::-webkit-scrollbar-thumb": {
          background: theme?.scrollBar?.color || "#aaa",
          borderRadius: "4px",
        },
        "*::-webkit-scrollbar-thumb:hover": {
          background: "#555",
        },
        "*::-webkit-scrollbar-corner": {
          background: "transparent",
        },
      }}
    />
  );
};

export default GlobalStyles;
