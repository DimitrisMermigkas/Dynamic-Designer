import {
  List,
  ListItemButton,
  Popover,
  PopoverPosition,
  Theme,
  Typography,
  useTheme,
} from "@mui/material";
import { makeStyles } from "tss-react/mui";
import React from "react";

// TODO jss-to-tss-react codemod: Unable to handle style definition reliably. Unsupported arrow function syntax.
// Arrow function has body type of ConditionalExpression instead of ObjectExpression.
const useStyles = makeStyles<{ name: string }>()((theme, { name }) => ({
  listItem: {
    paddingBlock: 0,
    display: "flex",
    columnGap: "4px",
    paddingInline: "8px",
    "&:hover": {
      background: "#4A5878",
    },
  },
  list: name == "Pointer" ? { margin: 0 } : { margin: 0, minWidth: "170px" },
}));

type CustomDrawerPopoverProps = {
  items: Record<string, { icon?: any; name?: string }[]>;
  openCustomPopover?: { popoverName: string; position?: PopoverPosition };
  handleClosePopover?: () => void;
  handleClick: (
    arg: { id?: string; itemNo?: number } | { index?: number }
  ) => void;
};

const CustomDrawerPopover = ({
  items,
  openCustomPopover,
  handleClosePopover,
  handleClick,
}: CustomDrawerPopoverProps) => {
  const theme = useTheme();
  const { classes } = useStyles({ name: openCustomPopover?.popoverName });
  const currentTheme = theme.palette.mode === "dark" ? "dark" : "light";
  const certainItems = items[openCustomPopover?.popoverName];

  return (
    <Popover
      open={true}
      anchorPosition={openCustomPopover?.position}
      onClose={handleClosePopover}
      anchorReference="anchorPosition"
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
    >
      {certainItems && (
        <List className={classes.list}>
          {certainItems.map((item, index) => (
            <ListItemButton
              key={index + "-listItem"}
              className={classes.listItem}
              onClick={() => {
                let props = {};
                if (openCustomPopover?.popoverName == "Layouts") {
                  props = { index: index };
                } else
                  props = {
                    id: openCustomPopover?.popoverName,
                    itemNo: index,
                  };
                handleClick(props);
              }}
            >
              {React.createElement(item.icon, {
                fill: currentTheme === "light" ? "black" : "white",
              })}
              {openCustomPopover?.popoverName !== "Pointer" && (
                <Typography
                  key={index}
                  variant="body1"
                  style={{ margin: "4px 0" }}
                >
                  {item.name}
                </Typography>
              )}
            </ListItemButton>
          ))}
        </List>
      )}
    </Popover>
  );
};

export default CustomDrawerPopover;
