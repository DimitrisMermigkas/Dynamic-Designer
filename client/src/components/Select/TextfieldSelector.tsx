import React from "react";
import AutocompleteVirtualized from "./AutocompleteVirtualized";

type TextfieldSelectorProps = {
  type: string;
  value: number;
  label: string;
  freeSolo: boolean;
  options: { label: string; value: number; [key: string]: any }[];
  onChange: (value: any) => void;
};

function TextfieldSelector({
  type,
  options,
  value,
  freeSolo,
  label,
  onChange,
}: TextfieldSelectorProps) {
  // Check if the current value exists in the options
  const currentValueExists = options.some((option) => option.value == value);

  // Create grouped options if current value does not exist
  const groupedOptions = currentValueExists
    ? options
    : [
        { value: value, label: `${value}`, group: "Current Value" },
        ...options.map((option) => ({ ...option, group: "All Options" })),
      ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (e.key === "Enter") {
      onChange(target.valueAsNumber);
      target.blur();
    }
  };
  const handleBlur = (e) => {
    const target = e.target as HTMLInputElement;
    if (target.valueAsNumber == 0 || Number.isNaN(target.valueAsNumber)) {
      onChange(value);
    } else onChange(target.valueAsNumber);
  };
  return (
    <AutocompleteVirtualized
      textfieldProps={{
        type: type,
        hasArrows: false,
        label: label,
        id: "textfield-selector",
        hasBorder: true,
        onKeyDown: handleKeyDown,
        onBlur: handleBlur,
      }}
      freeSolo={freeSolo}
      options={groupedOptions}
      value={value}
      onChange={(value) => {
        if (value !== undefined && value !== null) onChange(value);
      }}
      style={{ paddingBottom: 0 }}
    />
  );
}

export default TextfieldSelector;
