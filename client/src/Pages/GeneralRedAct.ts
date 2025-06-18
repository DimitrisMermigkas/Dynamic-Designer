import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";

const reducerName = "generalReducer";

type GeneralReducerState = {
  unsavedChangesByID: { [key: string]: boolean };
  selectedTheme: "light" | "dark";
};

const INITIAL_STATE: GeneralReducerState = {
  unsavedChangesByID: {},
  selectedTheme: "dark",
};

const slice = createSlice({
  name: reducerName,
  initialState: INITIAL_STATE,
  reducers: {
    updateUnsavedChangesByID: (
      state,
      { payload }: PayloadAction<{ id: string; hasChanges: boolean }>
    ) => {
      let newUnsavedChangesByID = {
        ...state.unsavedChangesByID,
        [payload.id]: payload.hasChanges,
      };
      return {
        ...state,
        unsavedChangesByID: newUnsavedChangesByID,
      };
    },
    clearUnsavedChangeByID: (state, { payload }: PayloadAction<string>) => {
      let newUnsavedChangesByID = {
        ...state.unsavedChangesByID,
      };
      delete newUnsavedChangesByID[payload];

      return {
        ...state,
        unsavedChangesByID: newUnsavedChangesByID,
      };
    },
    setSelectedTheme: (state, { payload }: PayloadAction<"light" | "dark">) => {
      return {
        ...state,
        selectedTheme: payload,
      };
    },
  },
});

const generalReducerPersistConfig = {
  key: "generalReducer",
  storage,
  blacklist: ["unsavedChangesByID"],
};

export const generalReducer = persistReducer(
  generalReducerPersistConfig,
  slice.reducer
);

export const generalActions = slice.actions;
