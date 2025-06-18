import React, { PropsWithChildren } from "react";
import Autocomplete, {
  AutocompleteRenderOptionState,
  createFilterOptions,
} from "@mui/material/Autocomplete";
import useMediaQuery from "@mui/material/useMediaQuery";
import ListSubheader from "@mui/material/ListSubheader";
import { useTheme } from "@mui/material/styles";
import { ListChildComponentProps, VariableSizeList } from "react-window";
import { Typography } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import CustomTextField from "../TextFields/CustomTextField";

const LISTBOX_PADDING = 8; // px

const useStyles = makeStyles()({
  listbox: {
    boxSizing: "border-box",
    "& ul": {
      padding: 0,
      margin: 0,
    },
  },
});

function renderRow(props: ListChildComponentProps) {
  const { data, index, style } = props;
  return React.cloneElement(data[index], {
    style: {
      ...style,
      top: (style.top as number) + LISTBOX_PADDING,
    },
  });
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data: any) {
  const ref = React.useRef<VariableSizeList>(null);
  React.useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);
  return ref;
}

// Adapter for react-window
export const ListboxComponent = React.forwardRef<
  HTMLDivElement,
  PropsWithChildren<{}>
>(function ListboxComponent(props, ref) {
  const { children, ...other } = props;
  const itemData = React.Children.toArray(children);
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up("sm"), { noSsr: true });
  const itemCount = itemData.length;
  const itemSize = smUp ? 32 : 48;

  const getChildSize = (child) => {
    if (React.isValidElement(child) && child.type === ListSubheader) {
      return 48;
    }

    return itemSize;
  };

  const getHeight = () => {
    if (itemCount > 12) {
      return 12 * itemSize;
    }
    return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
  };

  const gridRef = useResetCache(itemCount);

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={(index) => getChildSize(itemData[index])}
          overscanCount={5}
          itemCount={itemCount}
        >
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  );
});

const filter = createFilterOptions();

export type AutocompleteVirtualizedProps<
  ValueType,
  OptionType extends { label: string; value: ValueType; [key: string]: any }
> = Omit<
  Partial<React.ComponentProps<typeof Autocomplete>>,
  "onChange" | "options" | "value" | "renderOption" | "getOptionDisabled"
> & {
  label?: string;
  value: ValueType;
  options: OptionType[];
  placeholder?: string;
  onChange: (value: ValueType) => void;
  error?: boolean;
  helperText?: string;
  freeSolo?: boolean;
  textfieldProps?: React.ComponentProps<typeof CustomTextField>;
  disableAutoComplete?: boolean;
  renderOption?: (
    props: React.HTMLAttributes<HTMLLIElement> & { key: any },
    option: OptionType,
    state: AutocompleteRenderOptionState
  ) => React.ReactNode;
  getOptionDisabled?: (option: OptionType) => boolean;
  onCreate?: (value: string) => void;
};

function AutocompleteVirtualized<
  ValueType,
  OptionType extends { label: string; value: ValueType; [key: string]: any }
>({
  label,
  value,
  options,
  onChange,
  style,
  freeSolo,
  error,
  helperText,
  textfieldProps,
  disableAutoComplete,
  onCreate,
  ...props
}: AutocompleteVirtualizedProps<ValueType, OptionType>) {
  const { classes } = useStyles();

  const handleChange = (e, v: any) => {
    if (onCreate && v?.isNew) onCreate(v.value);
    else {
      onChange && (v ? onChange(v.value) : onChange(null));
    }
  };

  return (
    <Autocomplete
      classes={classes}
      disableListWrap
      disabled={disableAutoComplete}
      onChange={handleChange}
      options={options}
      getOptionLabel={(option) =>
        option ? (option instanceof Object ? option.label : option) : ""
      }
      renderInput={(params) => (
        <CustomTextField
          variant="outlined"
          {...params}
          placeholder={props.placeholder || label}
          label={label}
          error={error}
          helperText={helperText}
          size="small"
          {...textfieldProps}
          InputProps={{ ...params.InputProps, ...textfieldProps?.InputProps }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props}>
          <Typography noWrap={true} title={option.label}>
            {option.label}
          </Typography>
        </li>
      )}
      slotProps={{
        listbox: {
          component: ListboxComponent as React.ComponentType<
            React.HTMLAttributes<HTMLElement>
          >,
        },
      }}
      value={options.find((option) => option.value == value) || null}
      style={style}
      freeSolo={!!onCreate || freeSolo}
      filterOptions={
        onCreate &&
        ((options, params) => {
          const filtered = filter(options, params);

          const { inputValue } = params;
          // Suggest the creation of a new value
          const isExisting = options.some(
            (option) => inputValue === option.label
          );
          if (inputValue !== "" && !isExisting) {
            filtered.push({
              value: inputValue,
              label: `${inputValue} (New)`,
              isNew: true,
            });
          }

          return filtered;
        })
      }
      {...props}
    />
  );
}

export default AutocompleteVirtualized;
