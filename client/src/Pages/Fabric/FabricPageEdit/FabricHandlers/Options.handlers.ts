import { useMemo, useState } from "react";
import { setDimensionsCanvas } from "./Edit.handlers";

export const updateSelectedDesignState = (
  key,
  value,
  selectedDesign,
  setSelectedDesign,
  screenIndex
) => {
  const designScreens = [...selectedDesign.Configuration.screens]; // Create a copy of the screens array
  let newScreens = designScreens.map((screen, i) => {
    if (i == screenIndex) {
      const updatedScreen = { ...screen, [key]: value };
      return updatedScreen;
    } else return screen;
  });

  setSelectedDesign((prevState) => ({
    ...prevState,
    Configuration: {
      ...prevState.Configuration,
      screens: newScreens,
    },
  }));
};

const resolutions = {
  landscape: [
    { width: 1920, height: 1080 },
    { width: 1440, height: 900 },
    { width: 1366, height: 768 },
    { width: 1280, height: 800 },
    { width: 1280, height: 720 },
    { width: 1024, height: 768 },
    { width: 800, height: 600 },
  ],
  portrait: [
    { width: 1024, height: 1366, label: "1024 x 1366 (iPad Pro)" },
    { width: 768, height: 1024, label: "768 x 1024 (iPad)" },
    {
      width: 414,
      height: 896,
      label: "414 x 896 (iPhone XR/XS Max/11/11 Pro Max)",
    },
    { width: 375, height: 667, label: "375 x 667 (iPhone 6/7/8)" },
    { width: 320, height: 480, label: "320 x 480 (iPhone 3)" },
  ],
};

const useOptionsHandlers = ({
  canvas,
  selectedDesign,
  setSelectedDesign,
  screenIndex,
}: {
  canvas;
  selectedDesign;
  setSelectedDesign?: any;
  screenIndex;
}) => {
  const [libraryDialogOpen, setLibraryDialogOpen] = useState(false);
  const [openPlaylistDialog, setOpenPlaylistDialog] = useState(false);

  const handleLibraryDialogClose = () => {
    setLibraryDialogOpen(false);
  };

  const handleClosePlaylistDialog = () => {
    setOpenPlaylistDialog(false);
  };

  const width =
    selectedDesign?.Configuration?.screens?.[screenIndex]?.resolution?.width ||
    "";
  const height =
    selectedDesign?.Configuration?.screens?.[screenIndex]?.resolution?.height ||
    "";
  const canvasName =
    selectedDesign?.Configuration?.screens?.[screenIndex]?.name || "";

  const { isCustom, selectedResolution } = useMemo(() => {
    let isCustom = false;
    let selectedResolution = "";
    if (width === "" || height === "") {
      return { isCustom, selectedResolution };
    }
    let foundIndex = resolutions[
      selectedDesign.Configuration.screens[screenIndex].orientation
    ].findIndex(
      (res) => res.width === parseInt(width) && res.height === parseInt(height)
    );

    if (foundIndex === -1) {
      isCustom = true;
      selectedResolution = "custom";
    } else {
      isCustom = false;
      selectedResolution = `${parseInt(width)}x${parseInt(height)}`;
    }
    return { isCustom, selectedResolution };
  }, [width, height]);

  const handleResolutionChange = (event) => {
    const [width, height] = event.target.value.split("x");
    const value = {
      width: parseInt(width),
      height: parseInt(height),
    };
    const selectedRes = resolutions[
      selectedDesign.Configuration.screens[screenIndex].orientation
    ].find((res) => res.height === value.height && res.width === value.width);

    const existingDivs = document.querySelectorAll("#extraSpace");
    const editPageDiv = document.querySelector(".editPage");
    existingDivs.forEach((child) => editPageDiv.removeChild(child));
    const container = document.querySelector(".designatedArea");

    setDimensionsCanvas(
      canvas,
      selectedRes,
      container,
      selectedDesign.Configuration.screens[screenIndex].orientation
    );

    const allScreens = [...selectedDesign.Configuration.screens]; // Create a copy of the screens array
    const updatedScreens = allScreens.map((screen) => {
      if (screen.id == selectedDesign.Configuration.screens[screenIndex].id) {
        const newResScreen = {
          ...selectedDesign.Configuration.screens[screenIndex],
          resolution: selectedRes,
        };
        return newResScreen;
      } else return screen;
    });

    setSelectedDesign((prevState) => ({
      ...prevState,
      Configuration: {
        ...prevState.Configuration,
        screens: updatedScreens,
      },
    }));
  };

  const handleDimensionChange = (dimension) => (event) => {
    let value = parseInt(event.target.value);
    if (value <= 0) value = 1;

    let newResolution = {
      ...selectedDesign.Configuration.screens[screenIndex].resolution,
      [dimension]: value,
    };
    const container = document.querySelector(".designatedArea");
    setDimensionsCanvas(
      canvas,
      newResolution,
      container,
      selectedDesign.Configuration.screens[screenIndex].orientation
    );

    const allScreens = [...selectedDesign.Configuration.screens]; // Create a copy of the screens array
    const updatedScreens = updateAtIndex(allScreens, screenIndex, {
      ...selectedDesign.Configuration.screens[screenIndex],
      resolution: newResolution,
    });

    setSelectedDesign((prevState) => ({
      ...prevState,
      Configuration: {
        ...prevState.Configuration,
        screens: updatedScreens,
      },
    }));
  };

  const handleMakeDefaultScreen = (event) => {
    const designScreens = [...selectedDesign.Configuration.screens]; // Create a copy of the screens array
    let newScreens = designScreens.map((screen, i) => {
      if (i == screenIndex) {
        const updatedScreen = { ...screen, default: event.target.checked };
        return updatedScreen;
      } else return { ...screen, default: false };
    });

    setSelectedDesign((prevState) => ({
      ...prevState,
      Configuration: {
        ...prevState.Configuration,
        screens: newScreens,
      },
    }));
  };

  const handleCanvasNameChange = (
    value,
    selectedDesign,
    setSelectedDesign,
    screenIndex
  ) => {
    updateSelectedDesignState(
      "name",
      value,
      selectedDesign,
      setSelectedDesign,
      screenIndex
    );
  };

  function updateAtIndex<T>(array: T[], index: number, value: T) {
    return [...array.slice(0, index), value, ...array.slice(index + 1)];
  }

  return {
    canvasName,
    handleCanvasNameChange,
    width,
    height,
    isCustom,
    selectedResolution,
    resolutions,
    handleResolutionChange,
    handleDebounceDimensionChange: handleDimensionChange,
    libraryDialogOpen,
    handleLibraryDialogClose,
    openPlaylistDialog,
    handleClosePlaylistDialog,
    handleMakeDefaultScreen,
  };
};

export default useOptionsHandlers;
