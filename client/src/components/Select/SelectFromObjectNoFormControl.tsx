import { ListSubheader, OutlinedInput, styled, useTheme } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { groupBy, uniqueId } from "lodash";
import React, { useMemo } from "react";

// Styled components replacing makeStyles
const StyledSelect = styled(Select)(({ theme }) => ({
  // zIndex: 1,
  // "&:focus": {
  //   backgroundColor: "inherit",
  // },
}));

const StyledOutlinedInput = styled(OutlinedInput, {
  shouldForwardProp: (prop) =>
    !["fixedHeight", "background", "size", "ZeroPadding"].includes(
      prop as string
    ),
})<{
  fixedHeight?: number;
  background?: string;
  size?: "small" | "medium";
  ZeroPadding?: boolean;
}>(({ theme, fixedHeight, background, size }) => ({
  // height: fixedHeight,
  "& .MuiOutlinedInput-notchedOutline": {
    border:
      theme.palette.mode === "light" ? "1px solid rgb(213, 213, 213)" : "none",
    padding: "8px",
    borderRadius: size === "medium" ? "10px" : "4px",
  },
}));

type OnChangeOriginal = React.ComponentProps<typeof Select>["onChange"];
type OnChangeNew = (value: any) => void;

type SelectFromObjectNoFormControlProps = Omit<
  React.ComponentProps<typeof Select>,
  "onChange"
> & {
  background?: string;
  fixedHeight?: any;
  paddingStyle?: { Inline?: any; Block?: any; Right?: any };
  size?: "small" | "medium" | "large";
  ZeroPadding?: boolean;
  options: { value: any; label: string; disabled?: boolean; group?: string }[];
  placeholder?: string;
} & (
    | { keepOldOnChangeFormat: true; onChange?: OnChangeOriginal }
    | { keepOldOnChangeFormat?: false; onChange?: OnChangeNew }
  );

function SelectFromObjectNoFormControl(
  props: SelectFromObjectNoFormControlProps
) {
  const theme = useTheme();

  const [open, setOpen] = React.useState(false);

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  const labelId = useMemo(
    () => (props.label ? uniqueId("select-label-") : undefined),
    []
  );

  let optionsByGroup = groupBy(props.options, "group");

  return (
    <StyledSelect
      {...props}
      sx={{
        background: props.background || theme.palette.background.defaultDark,
        ...props.sx,
        borderRadius: "10px",
      }}
      variant="outlined"
      disabled={props.disabled}
      labelId={labelId}
      open={open}
      onClose={handleClose}
      onOpen={handleOpen}
      value={props.value}
      onChange={(event, child) => {
        if (!props.onChange) return;
        if (props.keepOldOnChangeFormat)
          (props.onChange as OnChangeOriginal)(event, child);
        else (props.onChange as OnChangeNew)(event.target.value);
      }}
      aria-label={
        props["aria-label"] || props.placeholder || (props.label as string)
      }
      error={props.error}
      fullWidth
      displayEmpty={props.displayEmpty}
      input={
        <StyledOutlinedInput
          placeholder={props.placeholder || (props.label as string)}
          fixedHeight={props.fixedHeight}
          background={props.background}
          size={props.size}
          ZeroPadding={props.ZeroPadding}
          sx={
            {
              // paddingInlineStart: props.paddingStyle?.Inline ?? 2,
              // paddingBlock: props.size === "medium" ? "15px" : "8px",
              // paddingInlineEnd: props.ZeroPadding ? 0 : "inherit",
              // position: "relative",
            }
          }
        />
      }
    >
      {Object.keys(optionsByGroup)
        .map((group) => {
          let groupItemsToRender = [];
          if (group !== "undefined")
            groupItemsToRender.push(
              <ListSubheader key={group} sx={{ backgroundColor: "inherit" }}>
                {group}
              </ListSubheader>
            );
          groupItemsToRender = groupItemsToRender.concat(
            optionsByGroup[group].map((option, index) => (
              <MenuItem
                key={`${group}-${index}`}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </MenuItem>
            ))
          );
          return groupItemsToRender;
        })
        .flat()}
    </StyledSelect>
  );
}

export default SelectFromObjectNoFormControl;
