import React from "react";
import Drawer from "@mui/material/Drawer";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  transitionDrawer: {
    position: "relative",
    left: -220,
    transition: `left 1s ${theme.transitions.easing.easeInOut}`,
  },
  transitionDrawerOpen: {
    left: 64.5,
  },
  anchorLeft: {
    left: "unset",
    top: "46px",
    height: "calc(100% - 46px)",
    overflow: "hidden",
  },
}));

const FabricSecondDrawer = ({ open, children }) => {
  const { classes } = useStyles();

  return (
    <Drawer
      classes={{
        root: classes.transitionDrawer,
        paperAnchorLeft: classes.anchorLeft,
      }}
      id="SecondDrawerV2"
      style={{
        width: "220px",
        height: "100%",
        position: "absolute",
        left: "64.5px",
        opacity: "1",
      }}
      variant="persistent"
      anchor="left"
      open={open}
    >
      <div
        style={{
          width: "220px",
          left: "64.5px",
          zIndex: 2998,
          height: "100%",
        }}
      >
        {children}
      </div>
    </Drawer>
  );
};

export default FabricSecondDrawer;
