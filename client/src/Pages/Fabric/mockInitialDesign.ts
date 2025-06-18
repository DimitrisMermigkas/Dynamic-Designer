import { v4 as uuidv4 } from "uuid";

export const mockInitialDesign = {
  ID: uuidv4(),
  CompanyID: uuidv4(),
  Name: "New Design Demo",
  Configuration: {
    screens: [
      {
        id: uuidv4(),
        name: "Screen-1",
        background: "#FFFFFF",
        default: true,
        onIdleReturn: {
          id: "",
          time: "",
        },
        orientation: "landscape" as const,
        resolution: {
          width: 1920,
          height: 1080,
        },
        objects: [],
      },
    ],
  },
};
