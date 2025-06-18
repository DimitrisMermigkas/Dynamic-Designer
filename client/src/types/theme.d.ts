import { Palette, PaletteOptions } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface TypeBackground {
    defaultLight?: string;
    defaultDark?: string;
    defaultTint?: string;
    borderLight?: string;
    imgColor?: string;
    gridColor?: string;
    primaryDrawer?: string;
    paper?: string;
    popover?: string;
    defaultDarkest?: string;
    tabSelected?: string;
  }

  interface Palette {
    background: TypeBackground;
    type: "light" | "dark";
    opacity: {
      level1: number;
      level2: number;
      level3: number;
    };
  }

  interface PaletteOptions {
    background?: Partial<TypeBackground>;
    type?: "light" | "dark";
    opacity?: {
      level1: number;
      level2: number;
      level3: number;
    };
  }

  interface Theme {
    scrollBar?: {
      width: number;
      color: string;
    };
  }

  interface ThemeOptions {
    scrollBar?: {
      width: number;
      color: string;
    };
  }
}
