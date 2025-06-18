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

function App() {
  const theme = createTheme(themeDefault("dark", "ltr"));
  return (
    <DndProvider backend={HTML5Backend}>
      <GlobalStyles />
      <PersistGate loading={null} persistor={persistor}>
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <div className="App">
              <FabricPage />
            </div>
          </ThemeProvider>
        </Provider>
      </PersistGate>
    </DndProvider>
  );
}

export default App;
