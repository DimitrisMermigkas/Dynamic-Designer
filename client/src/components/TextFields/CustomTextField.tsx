import React, { useCallback } from "react";
import { TextField as MTextField, Theme, styled } from "@mui/material";
import { debounce } from "lodash";

export type CustomTextFieldProps = React.ComponentProps<typeof MTextField> & {
  fixedHeight?: string;
  hasBorder?: boolean;
  hasArrows?: boolean;
  min?: number;
  max?: number;
};

const CustomTextFieldRoot = styled(MTextField, {
  shouldForwardProp: (prop) =>
    !["fixedHeight", "hasBorder", "hasArrows", "min", "max"].includes(
      prop as string
    ),
})<CustomTextFieldProps>(({ theme, margin, label, hasArrows }) => ({
  marginTop: margin === "none" || !label ? 0 : theme.spacing(2),
  ...(!hasArrows && {
    "& input[type=number]": {
      "-moz-appearance": "textfield",
    },
    "& input[type=number]::-webkit-outer-spin-button": {
      "-webkit-appearance": "none",
      margin: 0,
    },
    "& input[type=number]::-webkit-inner-spin-button": {
      "-webkit-appearance": "none",
      margin: 0,
    },
  }),
}));

const CustomTextField = ({
  hasBorder = false,
  hasArrows = true,
  ...props
}: CustomTextFieldProps) => {
  const handleDebounce = (props) => (event) => {
    props.onChange(event);
    const intValue = parseInt(event.target.value) || 0;
    if (props.max && intValue > props.max)
      debounce_fun(props.onChange, props.max);
    else if (props.min && intValue <= props.min)
      debounce_fun(props.onChange, props.min);
  };

  const debounce_fun = useCallback(
    debounce(function (onChange, value) {
      const e = { target: { value: value } };
      onChange(e);
    }, 1000),
    []
  );

  return (
    <CustomTextFieldRoot
      variant="outlined"
      size="small"
      {...props}
      hasArrows={hasArrows}
      onChange={
        props?.type === "number" && (props?.min || props?.max)
          ? handleDebounce(props)
          : props.onChange
      }
      sx={{
        "& .MuiInputBase-root": {
          background: (theme) => theme.palette.background.defaultDark,
          borderRadius: "10px",
          minHeight: props.fixedHeight || "36px",
        },
        "& .MuiInputBase-input": {
          paddingInline: "14px",
          paddingInlineEnd: 0,
          color: (theme) => theme.palette.text.primary,
        },
        "& .MuiOutlinedInput-notchedOutline": {
          border: (theme) =>
            theme.palette.mode === "light"
              ? `1px solid ${theme.palette.text.secondary}`
              : hasBorder
              ? `1px solid ${theme.palette.text.secondary}`
              : "none",
        },
        "& .MuiInputLabel-shrink": {
          translate: (theme) =>
            theme.palette.mode === "light" || hasBorder
              ? "unset"
              : "-14px -6px",
        },
        ...props.sx,
      }}
    />
  );
};

export default CustomTextField;
