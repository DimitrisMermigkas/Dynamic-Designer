import React from "react";
import { Grid2, useTheme } from "@mui/material";
import useMobileDevice from "../../hooks/useMobileDevice";
import { isMobile } from "react-device-detect";

type ButtonsContainerProps = {
  children?: React.ReactNode;
  classNames?: {
    refresh?: string;
    defaultSet?: string;
  };
  withBack?: boolean;
};

const ButtonsContainer = ({
  children,
  classNames,
  withBack,
}: ButtonsContainerProps) => {
  const theme = useTheme();
  let childrenArray = Array.isArray(children)
    ? children
    : children
    ? [children]
    : [];
  let counter = [];
  let styl = [];
  const desktop = useMobileDevice() === "desktop";
  childrenArray.map((comp, index) => {
    if (comp == false || comp == undefined) return;
    else {
      counter = [...counter, index];
    }
  });
  if (!desktop) {
    if (classNames) {
      if (counter.length == 1) styl[counter[0]] = { width: "80%" };
      if (counter.length == 2 && classNames.refresh === "RefreshMinimized") {
        styl[counter[1]] = { width: "80%" };
      }
      if (counter.length == 2 && classNames.refresh === "Refresh") {
        styl[counter[0]] = { width: "45%" };
        styl[counter[1]] = { width: "45%" };
      }
      if (
        counter.length == 3 &&
        classNames.refresh === "RefreshMinimized" &&
        classNames.defaultSet
      ) {
        styl[counter[1]] = { width: "45%" };
        styl[counter[2]] = { width: "30%" };
      }
    } else {
      if (counter.length == 2) {
        if (withBack) styl[counter[1]] = { width: "70%" };
        else styl[counter[1]] = { width: "80%" };
      }
      if (counter.length == 3) {
        styl[counter[0]] = { width: "20%" };
        styl[counter[2]] = { width: "55%" };
      }
    }
  }

  return (
    <Grid2
      container
      spacing={2}
      alignItems="center"
      style={
        isMobile
          ? {
              position: "absolute",
              display: "flex",
              justifyContent: "center",
              left: 0,
              bottom: "8px",
              background: "#282A2F",
              height: "74px",
            }
          : desktop
          ? { width: "unset" }
          : null
      }
    >
      {childrenArray.map(
        (child, index) =>
          child && (
            <Grid2 key={index} style={styl[index]}>
              {child}
            </Grid2>
          )
      )}
    </Grid2>
  );
};

export default ButtonsContainer;
