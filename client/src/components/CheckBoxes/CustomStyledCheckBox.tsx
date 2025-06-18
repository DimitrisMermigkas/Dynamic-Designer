import React from "react";
import { Checkbox as MCheckBox } from "@mui/material";

const CustomStyledCheckBox = (
  props: React.ComponentProps<typeof MCheckBox>
) => {
  return <MCheckBox color="secondary" {...props}></MCheckBox>;
};

export default CustomStyledCheckBox;
