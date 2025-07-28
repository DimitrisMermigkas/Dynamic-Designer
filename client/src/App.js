import React from "react";
import { Provider, useSelector } from "react-redux";
import "./App.css";
import { store, persistor } from "./reduxConfig/reduxStoreConfig";
import FabricPage from "./Pages/Fabric/FabricPage";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import themeDefault from "./theme-default";
import { createTheme, ThemeProvider } from "@mui/material";
import GlobalStyles from "./hooks/useGlobalStyles";
import { PersistGate } from "redux-persist/integration/react";

function AppContent() {
  const selectedTheme = useSelector(
    (state) => state.generalReducer.selectedTheme
  );

  const theme = createTheme(themeDefault(selectedTheme, "ltr"));

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <FabricPage />
      </div>
    </ThemeProvider>
  );
}

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <GlobalStyles />
      <PersistGate loading={null} persistor={persistor}>
        <Provider store={store}>
          <AppContent />
        </Provider>
      </PersistGate>
    </DndProvider>
  );
}

export default App;
