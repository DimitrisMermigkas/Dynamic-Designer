import {
  Backdrop,
  Box,
  BoxProps,
  CircularProgress,
  styled,
  SxProps,
  Theme,
} from "@mui/material";
import React from "react";

const LoadingDiv = styled(Box)({
  position: "relative",
});

interface LoadingHOCProps extends BoxProps {
  isLoading: boolean;
  children: React.ReactNode;
}

const backdropSx: SxProps<Theme> = (theme) => ({
  zIndex: theme.zIndex.modal,
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  right: 0,
  bottom: 0,
  top: 0,
  left: 0,
  backgroundColor: `${theme.palette.background.default}99`,
  WebkitTapHighlightColor: "transparent",
});

const LoadingHOC: React.FC<LoadingHOCProps> = ({
  isLoading,
  children,
  ...props
}) => (
  <LoadingDiv {...props}>
    {children}
    <Backdrop open={isLoading || false} sx={backdropSx}>
      <CircularProgress color="primary" />
    </Backdrop>
  </LoadingDiv>
);

export default LoadingHOC;
