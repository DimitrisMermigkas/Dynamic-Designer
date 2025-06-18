import React, { ForwardedRef } from "react";
import { Divider, Paper, Theme, Typography, useTheme } from "@mui/material";
import { makeStyles } from 'tss-react/mui';
import styled from "styled-components";
import { isMobile } from "react-device-detect";

const useStyles = makeStyles()({
  paper: {
    height: "100%",
    minHeight: 240,
    width: "100%",
    boxSizing: "border-box",
    display: "flex",
    flexFlow: "column",
  },
  titleTypography: {
    maxWidth: "100%",
    textOverflow: "ellipsis",
    overflow: "hidden",
  },
});

const ToolbarDiv = styled.div<{
  $theme: Theme;
  $variant: "default" | "contrast";
}>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 52px;
  padding-left: ${({ $theme }) => $theme.spacing(3)};
  padding-right: ${({ $theme }) => $theme.spacing(1)};
  padding-block: ${({ $theme }) => $theme.spacing(0.5)};
  box-sizing: border-box;
  background-color: ${({ $theme, $variant }) =>
    $variant === "contrast"
      ? $theme.palette.background.defaultLight
      : $theme.palette.background.default};
`;

const ActionsDiv = styled.div`
  display: flex;
  align-items: center;
`;

const ContentDiv = styled.div<{ $theme: Theme }>`
  flex: 1 1 auto;
  overflow: auto;
  padding-top: ${({ $theme }) => $theme.spacing(2)};
`;

type PaperWithTitleProps = {
  title: React.ReactNode;
  actions?: React.ReactNode;
  divider?: boolean;
  variant?: "default" | "contrast";
  style?: React.CSSProperties;
  toolbarStyle?: React.CSSProperties;
  actionsContainerStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  fullHeightMobile?: string | number;
  children?: React.ReactNode;
};

const PaperWithTitle = React.forwardRef(
  (
    {
      title,
      actions,
      divider,
      variant = "default",
      style,
      toolbarStyle,
      actionsContainerStyle,
      contentStyle,
      fullHeightMobile,
      children,
    }: PaperWithTitleProps,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const { classes } = useStyles();
    const theme = useTheme();

    const titleRendered =
      typeof title === "string" ? (
        <Typography
          className={classes.titleTypography}
          variant={variant === "contrast" ? "subtitle2" : "h6"}
          color={variant === "contrast" ? "textSecondary" : "textPrimary"}
          title={title}
        >
          {title}
        </Typography>
      ) : (
        title
      );

    return (
      <Paper
        ref={ref}
        classes={{ root: classes.paper }}
        style={
          isMobile
            ? {
                height: fullHeightMobile || "400px",
                minHeight: fullHeightMobile,
                ...style,
              }
            : style
        }
      >
        <ToolbarDiv $theme={theme} $variant={variant} style={toolbarStyle}>
          {titleRendered}
          <ActionsDiv style={actionsContainerStyle}>{actions}</ActionsDiv>
        </ToolbarDiv>
        {divider && <Divider />}
        <ContentDiv $theme={theme} style={contentStyle}>
          {children}
        </ContentDiv>
      </Paper>
    );
  }
);

export default PaperWithTitle;
