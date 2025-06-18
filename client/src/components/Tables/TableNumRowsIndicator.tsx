import React from "react";
import { makeStyles } from 'tss-react/mui';


const useStyles = makeStyles()((theme) => {
  const gradientDegrees = theme.direction === "rtl" ? 270 : 90;
  return {
    root: {
      marginInlineStart: theme.spacing(1.5),
      padding: theme.spacing(0.5, 2, 0.5, 1),
      borderRadius: 10,
      background:
        theme.palette.mode === "light"
          ? `linear-gradient(${gradientDegrees}deg, #E0E0E0 12.5%, rgba(249, 251, 253, 0) 278.21%)`
          : `linear-gradient(${gradientDegrees}deg, #131316 12.5%, rgba(27, 28, 32, 0) 100%)`,
    },
  };
});

const TableNumRowsIndicator = ({ total }: { total?: number }) => {
  const { classes } = useStyles();

  return total ? (
    <div className={classes.root} title={`${total} items`}>
      {total}
    </div>
  ) : null;
};

export default TableNumRowsIndicator;
