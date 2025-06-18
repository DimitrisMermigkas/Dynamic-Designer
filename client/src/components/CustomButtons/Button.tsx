import React from "react";
import { Button as MButton } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { isMobile } from "react-device-detect";
import { useAppSelector } from "../../reduxConfig/reduxHooks";

const useStyles = makeStyles()((theme) => ({
  outlinedOrContained: {
    minWidth: isMobile ? null : 120,
    height: isMobile ? 36 : 46,
    borderRadius: 10,
    width: isMobile ? "100%" : null,
    color: isMobile ? "#FFFFFF" : theme.palette.text.primary,
  },
  rounded: {
    minWidth: 0,
    padding: 4,
    borderRadius: 20,
    width: 38,
    height: 38,
    color: isMobile ? "#FFFFFF" : theme.palette.text.primary,
  },
  contained: {
    paddingInlineStart: theme.spacing(4),
    paddingInlineEnd: theme.spacing(4),
  },
  containedRed: {
    borderRadius: "10px",
    color: "#fff",
    width: isMobile ? "100%" : "122px",
    height: isMobile ? "36px" : "46px",
  },
  defaultColor: {
    color: theme.palette.text.primary,
  },
}));

type ButtonProps = Omit<React.ComponentProps<typeof MButton>, "variant"> & {
  variant?: "rounded" | "text" | "outlined" | "contained";
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "text", ...props }, ref) => {
    const { classes, cx } = useStyles();
    const currentTheme = useAppSelector(
      (state) => state.generalReducer.selectedTheme
    );
    return (
      <MButton
        ref={ref}
        classes={{
          root: cx(
            variant === "rounded" && classes.rounded,
            (variant === "outlined" || variant === "contained") &&
              classes.outlinedOrContained,
            variant === "text" && !props.color && classes.defaultColor
          ),
          contained: classes.containedRed,
        }}
        variant={variant === "rounded" ? "outlined" : variant}
        {...props}
        style={
          currentTheme === "light"
            ? {
                ...props.style,
                borderColor: isMobile
                  ? " rgba(255, 255, 255, 0.23)"
                  : "rgba(0, 0, 0, 0.23)",
              }
            : { ...props.style }
        }
      >
        {props.children}
      </MButton>
    );
  }
);

export default Button;
