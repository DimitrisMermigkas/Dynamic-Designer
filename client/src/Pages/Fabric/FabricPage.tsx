import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import FabricPageEdit from "./FabricPageEdit/FabricPageEdit";
import WelcomeDialog from "./FabricPageEdit/FabricComponents/WelcomeDialog";

const FabricPage = () => {
  const [screenIndex, setScreenIndex] = useState(0);
  const initialDesign = useSelector(
    (state: any) => state.fabricPageReducer.designs[0]
  );
  const isFirstVisit = useSelector(
    (state: any) => state.fabricPageReducer.isFirstVisit
  );

  useEffect(() => {
    console.log("isFirstVisit", isFirstVisit);
  }, [isFirstVisit]);
  return (
    <>
      <FabricPageEdit
        initialDesign={initialDesign}
        screenIndex={screenIndex}
        setScreenIndex={setScreenIndex}
      />
      <WelcomeDialog open={isFirstVisit} manualTrigger={isFirstVisit} />
    </>
  );
};

export default FabricPage;
