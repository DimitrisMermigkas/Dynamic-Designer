import React from "react";
import { Button, Typography } from "@mui/material";

type ButtonOutlinedProps = {
  component?: string;
  text?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  imgStyle?: React.CSSProperties;
  textStyle?: React.CSSProperties;
  btnStyle?: React.CSSProperties;
};

const ButtonOutlined = ({
  component,
  text,
  onClick,
  imgStyle,
  textStyle,
  btnStyle,
}: ButtonOutlinedProps) => {
  return (
    <Button style={btnStyle} onClick={onClick} variant="outlined">
      {component && <img style={imgStyle} src={component} alt="svg" />}
      <Typography style={textStyle}>{text}</Typography>
    </Button>
  );
};
export default ButtonOutlined;
