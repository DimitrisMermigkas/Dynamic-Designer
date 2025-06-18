import React from "react";
import { Input } from "@mui/material";
import { makeStyles } from 'tss-react/mui';
import { Select } from "@mui/material";

const useStyles = makeStyles()((theme) => ({
  underline: {
    "&::before": {
      border: "none",
    },
    "&::after": {
      border: "none",
    },
    "&&:hover::before": {
      border: "none",
    },
  },
  root: {
    border: `1px solid ${theme.palette.text.secondary}`,
    borderRadius: "8px",
    paddingLeft: "8px",
  },
}));

const SelectOutlined = ({ value, onChange, children }) => {
  const { classes } = useStyles();
  return (
    (<Select
      variant="standard"
      labelId="resolution-label"
      id="resolution"
      value={value}
      onChange={onChange}
      input={
        <Input
          classes={{
            underline: classes.underline,
            root: classes.root,
          }}
        />
      }>
      {children}
    </Select>)
  );
};
export default SelectOutlined;
