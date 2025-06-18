import FormControl, { FormControlProps } from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import { SxProps } from "@mui/material/styles";
import { uniqueId } from "lodash";
import React, { useState } from "react";
import SelectFromObjectNoFromControl from "./SelectFromObjectNoFormControl";

type SelectFromObjectProps = React.ComponentProps<
  typeof SelectFromObjectNoFromControl
> & { helperText?: string; sx?: SxProps; formControlProps?: FormControlProps };

function SelectFromObject({
  formControlProps,
  ...props
}: SelectFromObjectProps) {
  const [labelId] = useState(() => props.label ? uniqueId("select-label-") : undefined);

  return (
    <FormControl
      disabled={props.disabled}
      aria-label={props["aria-label"]}
      variant={props.variant}
      sx={{
        margin: "0px",
        minWidth: "100px",
        maxWidth: "250px",
        marginTop: props.margin === "none" ? "0px" : "2px",
        "& .MuiInputLabel-shrink": {
          translate: "-14px -6px",
        },
      }}
      style={{ ...props.style }}
      error={props.error}
      required={props.required}
      size="small"
      {...formControlProps}
    >
      {props.label && (
        <InputLabel id={labelId} sx={{ zIndex: 1 }}>
          {props.label}
        </InputLabel>
      )}
      <SelectFromObjectNoFromControl {...props} />
      {props.helperText && <FormHelperText>{props.helperText}</FormHelperText>}
    </FormControl>
  );
}

export default SelectFromObject;
