import { IconButtonProps, IconButton as MuiIconButton } from "@mui/material";
import React from "react";

const CustomIconButton = (props: IconButtonProps) => {
  return (
    <MuiIconButton
      sx={{ color: !props.color ? "text.primary" : undefined, ...props.sx }}
      {...props}
    />
  );
};

export default CustomIconButton;
