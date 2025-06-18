import React from "react";
import useLoadJson from "./hooks/useLoadJson";
import { Screen } from "@client/schemas/schemaDesigner";
import Screens from "./components/Screens";

function App() {
  const { json: designJson, error } = useLoadJson();

  if (error || !designJson?.screens || designJson.screens.length === 0)
    return <span></span>;

  return (
    <div className="App">
      <Screens screens={designJson?.screens as Screen[]} />
    </div>
  );
}

export default App;
