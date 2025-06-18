import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { mockInitialDesign } from "./mockInitialDesign";
import { Design } from "../../schemas/schemaDesigner";

const reducerName = "fabricPageReducer";

interface Point {
  x: number;
  y: number;
}

interface Line {
  points: Point[];
  type: string;
}

interface FabricPageState {
  startDrawing: boolean;
  drawingType: string;
  activeLine: Line | null;
  activeShape: any | null;
  pointArray: Point[];
  lineArray: Line[];
  selectArea: boolean;
  startingPointer: Point | null;
  designs: Design[];
  isFirstVisit: boolean;
  MsgShownToday: string;
}

const INITIAL_STATE: FabricPageState = {
  startDrawing: false,
  drawingType: "",
  activeLine: null,
  activeShape: null,
  pointArray: [],
  lineArray: [],
  selectArea: false,
  startingPointer: null,
  designs: [mockInitialDesign],
  isFirstVisit: true,
  MsgShownToday: "",
};

const reducer = createSlice({
  name: reducerName,
  initialState: INITIAL_STATE,
  reducers: {
    setStartingPointer: (state, action: PayloadAction<Point | null>) => {
      return {
        ...state,
        startingPointer: action.payload,
      };
    },
    setStartSelectingArea: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        selectArea: action.payload,
      };
    },
    setStartDrawing: (
      state,
      action: PayloadAction<{ value: boolean; element: string }>
    ) => {
      return {
        ...state,
        startDrawing: action.payload.value,
        drawingType: action.payload.element,
      };
    },
    setActiveLine: (state, action: PayloadAction<Line | null>) => {
      return {
        ...state,
        activeLine: action.payload,
      };
    },
    setPointArray: (state, action: PayloadAction<Point[]>) => {
      if (action?.payload?.length === 0) state.pointArray = [];
      else state.pointArray.push(...action.payload);
    },
    setLineArray: (state, action: PayloadAction<Line[]>) => {
      let newArray = [...state.lineArray];
      if (action.payload.length === 0) newArray = [];
      else newArray.push(...action.payload);
      return {
        ...state,
        lineArray: newArray,
      };
    },
    setActiveShape: (state, action: PayloadAction<any>) => {
      return {
        ...state,
        activeShape: action.payload,
      };
    },
    // Design actions
    setDesigns: (state, action: PayloadAction<Design[]>) => {
      state.designs = action.payload;
    },
    addDesign: (state, action: PayloadAction<Design>) => {
      state.designs.push(action.payload);
    },
    updateDesign: (state, action: PayloadAction<Design>) => {
      const index = state.designs.findIndex((d) => d.ID === action.payload.ID);
      if (index !== -1) {
        state.designs[index] = action.payload;
      }
    },
    deleteDesign: (state, action: PayloadAction<string>) => {
      state.designs = state.designs.filter((d) => d.ID !== action.payload);
    },
    setFirstVisit: (state, action: PayloadAction<boolean>) => {
      state.isFirstVisit = action.payload;
    },
    setMsgShownToday: (state, action: PayloadAction<string>) => {
      state.MsgShownToday = action.payload;
    },
  },
});

export const fabricPageReducer = reducer.reducer;
export const fabricPageActions = reducer.actions;
