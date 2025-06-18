import {
  createTheme,
  Direction,
  ThemeOptions,
  PaletteOptions,
} from "@mui/material/styles";
import deepcopy from "deepcopy";
import _, { range } from "lodash";
import tinycolor from "tinycolor2";

// Extend the PaletteOptions type to include our custom properties
interface CustomPaletteOptions extends PaletteOptions {
  background?: {
    light?: string;
    defaultDark?: string;
    defaultLight?: string;
    defaultTint?: string;
    borderLight?: string;
    imgColor?: string;
    gridColor?: string;
    primaryDrawer?: string;
    paper?: string;
    popover?: string;
    defaultDarkest?: string;
    tabSelected?: string;
  };
  opacity?: {
    level1: number;
    level2: number;
    level3: number;
  };
  contrast?: {
    main: string;
  };
  backgroundImage?: string;
}

interface CustomThemeOptions extends ThemeOptions {
  palette?: CustomPaletteOptions;
  appBar?: {
    height: number;
    backgroundColor?: string;
    contrastText?: string;
    secondary?: string;
  };
  drawer?: {
    open: number;
    closed: number;
    mobile: number;
  };
  footer?: {
    mobileButtons: number;
  };
  editDashboardDrawer?: {
    open: number;
    closed: number;
  };
  loadingBar?: {
    height: number;
  };
  tileRibbon?: { height: number };
  apexChart?: {
    colors: string[];
    fontSize: string;
    xaxisFontSize: string;
    xaxisTitleFontSize: string;
    yaxisFontSize: string;
    legendFontSize: string;
    fontColor?: string;
    borderColor?: string;
  };
  scrollBar?: {
    width: number;
    color: string;
  };
}

const primary = "#e51a29";
const secondaryDarkTheme = "#d6d6d6";
const secondaryLightTheme = "#777";
const darkThemeTextPrimary = "#DDDDDD";
const darkThemeTextSecondary = "#7C8085";

const lightThemeTextPrimary = "#1F2126";
const lightThemeTextSecondary = "#727578";

const lightThemeAppBar = "#FFFFFF";
const green = "#72C180";

const lightenRate = 7.5;
const darkenRate = 15;

const baseTheme: CustomThemeOptions = {
  palette: {
    primary: {
      main: primary,
      light: tinycolor(primary).lighten(lightenRate).toHexString(),
      dark: tinycolor(primary).darken(darkenRate).toHexString(),
    },
    success: {
      main: green,
    },
    background: {
      light: "#F5F5F5",
    },
    opacity: { level1: 0.5, level2: 0.25, level3: 0.1 },
  },
  typography: {
    fontFamily: "Poppins, Inter, sans-serif",
    h4: {
      fontSize: "2rem",
    },
    subtitle2: {
      fontWeight: 600,
    },
  },
  appBar: {
    height: 64,
  },
  drawer: {
    open: 200,
    closed: 72,
    mobile: 131,
  },
  footer: {
    mobileButtons: 74,
  },
  editDashboardDrawer: {
    open: 320,
    closed: 0,
  },
  loadingBar: {
    height: 5,
  },
  tileRibbon: { height: 48 },
  apexChart: {
    colors: [primary, green, "#E4B758", "#C0C0C0", "#2F394F", "#D4526E"],
    fontSize: "12px",
    xaxisFontSize: "11px",
    xaxisTitleFontSize: "11px",
    yaxisFontSize: "11px",
    legendFontSize: "11px",
  },
  scrollBar: {
    width: 6,
    color: "#727578",
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  components: {
    MuiAccordionSummary: {
      styleOverrides: {
        expandIconWrapper: {
          padding: "12px",
        },
      },
    },
    MuiGrid2: {
      styleOverrides: {
        container: {
          width: "100%",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          ...(ownerState.orientation === "vertical" &&
            ownerState.variant === "middle" && {
              marginLeft: theme.spacing(2),
              marginRight: theme.spacing(2),
            }),
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "initial",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "unset" },
        rounded: {
          borderRadius: 10,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "initial",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: "0.85rem",
        },
      },
    },
  },
};

const darkTheme: ThemeOptions = _.merge(deepcopy(baseTheme), {
  palette: {
    mode: "dark",
    secondary: {
      main: secondaryDarkTheme,
      light: tinycolor(secondaryDarkTheme).lighten(lightenRate).toHexString(),
      dark: tinycolor(secondaryDarkTheme).darken(darkenRate).toHexString(),
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#212227",
      defaultDark: "#1C1D21",
      defaultLight: "#282A2F",
      defaultTint: "#C4C4C4",
      borderLight: "#383b42",
      imgColor: "#434343",
      gridColor: "rgba(240, 240, 240, 0.05)",
      primaryDrawer: "#282A2F",
      paper: "#212227",
      popover: "#2B2E32",
      defaultDarkest:
        "linear-gradient(118.88deg, #1C1D21 -1.65%, #161619 101.25%)",
      tabSelected: "linear-gradient(rgb(23, 24, 26) 0%, rgb(33, 35, 39) 100%)",
    },
    contrast: {
      main: "#343f57",
    },
    backgroundImage: "/static/images/pmeBackground.png",
    text: {
      primary: darkThemeTextPrimary,
      secondary: darkThemeTextSecondary,
      contrast: "#FFFFFF",
    },
  },
  appBar: {
    backgroundColor: "#212227",
    contrastText: "#FFF",
    secondary: "#434343",
  },
  apexChart: {
    // colors: ["#ff0000", "#546E7A", "#D4526E", "#13D8AA", "#A5978B", "#CFCFEA"],
    fontColor: "#ffffff",
    borderColor: "#333333",
  },
  typography: {
    allVariants: {
      color: darkThemeTextPrimary,
    },
    h4: {
      color: "#FFFFFF",
    },
    h5: {
      color: "#FFFFFF",
    },
    h6: {
      color: "#FFFFFF",
    },
  },
  shadows: ["none"].concat(
    range(24).map((i) => {
      const h = Math.ceil((i + 1) / 2);
      const v = Math.floor((i + 1) / 2);
      const blur = Math.ceil((5 * (i + 1)) / 7);
      const spread = -Math.ceil((i + 1) / 7);
      return `rgb(0 0 0 / 70%) ${h}px ${v}px ${blur}px ${spread}px`;
    })
  ),
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          variants: [
            {
              props: { variant: "outlined" },
              style: { borderColor: "rgba(255, 255, 255, 0.23)" },
            },
            {
              props: { variant: "text" },
              style: {
                fontWeight: 500,
              },
            },
          ],
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: darkThemeTextSecondary,
        },
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          color: darkThemeTextSecondary,
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: darkThemeTextPrimary,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: "#2B2E32",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          border: "#282A2F solid",
        },
      },
    },
  },
});

const lightTheme: ThemeOptions = _.merge(deepcopy(baseTheme), {
  palette: {
    mode: "light",
    secondary: {
      main: secondaryLightTheme,
      light: tinycolor(secondaryLightTheme).lighten(lightenRate).toHexString(),
      dark: tinycolor(secondaryLightTheme).darken(darkenRate).toHexString(),
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#FFFFFF",
      defaultDark: "#F2F4F8",
      defaultLight: "#F3F2F5",
      defaultTint: "#999",
      imgColor: "#DADADA", //tinycolor(lightThemeAppBar).lighten(lightenRate).toHexString(),
      gridColor: "#D5D5D5",
      primaryDrawer: "#282A2F",
      popover: "#FFFFFF",
      defaultDarkest: "#F2F4F8",
      tabSelected:
        "linear-gradient(94.39deg, #E8F0F7 14.65%, rgba(255, 255, 255, 0) 164.2%)",
    },
    contrast: {
      main: "#DBDBDB",
    },
    backgroundImage: "/static/images/pmeBackgroundLight.png",
    text: {
      primary: lightThemeTextPrimary,
      secondary: lightThemeTextSecondary,
      contrast: "#000000",
    },
  },
  appBar: {
    backgroundColor: lightThemeAppBar,
    contrastText: "#FFF",
    secondary: tinycolor(lightThemeAppBar)
      .lighten(lightenRate * 2)
      .toHexString(),
  },
  apexChart: {
    fontColor: "#000000",
    borderColor: "#D5D5D5",
  },
  shadows: ["none"].concat(
    range(24).map((i) => {
      const h = Math.ceil((i + 1) / 2);
      const v = Math.floor((i + 1) / 2);
      const blur = Math.ceil((5 * (i + 1)) / 7);
      const spread = -Math.ceil((i + 1) / 7);
      return `rgb(0 0 0 / 50%) ${h}px ${v}px ${blur}px ${spread}px`;
    })
  ),
  typography: {
    allVariants: {
      color: "#000000",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          variants: [
            {
              props: { variant: "outlined" },
              style: { borderColor: "rgba(0, 0, 0, 0.23)" },
            },
            {
              props: { variant: "text" },
              style: {
                color: lightThemeTextPrimary,
                fontWeight: 500,
              },
            },
          ],
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: "#FFFFFF",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        textColorPrimary: {
          color: "rgba(0, 0, 0, 0.87)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          border: "#FFFFFF solid",
        },
        elevation1: {
          boxShadow:
            "-1px -1px 2px rgba(0, 0, 0, 0.07), 0px 4px 34px rgba(0, 0, 0, 0.07)",
        },
      },
    },
  },
});

const themeDefault = (type: "dark" | "light", direction: Direction) => {
  type = type || "dark";
  const chosenTheme = type === "light" ? lightTheme : darkTheme;
  chosenTheme.direction = direction;
  return createTheme(chosenTheme);
};

export { darkTheme, lightTheme };
export default themeDefault;
