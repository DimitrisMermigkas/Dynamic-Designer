import React, { useState } from "react";

const tourConfig = [
  {
    selector: '[data-tut="Canvas"]',
    content: `Welcome to the Product.Me designer tutorial.Lets begin!`,
    position: "right",
  },
  {
    selector: '[data-tut="ToolbarIcons"]',
    content: `This toolbar provides quick access to various features.`,
    position: "bottom",
  },
  {
    selector: '[data-tut="CanvasObjects"]',
    content: `You can select between elements and widgets...`,
  },
  {
    selector: '[data-tut="Layouts"]',
    content: () => (
      <div style={{ display: "flex", rowGap: "8px", flexDirection: "column" }}>
        <span>You can configure the layout of the canvas</span>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* <img src={LayoutEditorGif} alt="LayoutEditorGif"></img> */}
        </div>
      </div>
    ),
  },
  {
    selector: '[data-tut="Layers"]',
    content: () => (
      <div style={{ display: "flex", rowGap: "8px", flexDirection: "column" }}>
        <span>Or preview the stacking order of your objects</span>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* <img src={LayersEditorGif} alt="LayersEditorGif"></img> */}
        </div>
      </div>
    ),
  },
  {
    selector: '[data-tut="LayersIcons"]',
    content: `You can also control the stacking order of objects on the canvas using these buttons. Bring objects forward, backward, to the top, or to the bottom as needed.`,
  },
  {
    selector: '[data-tut="Tabs"]',
    content: `The options drawer. This drawer provides access to different functionalities.`,
  },
  {
    selector: '[data-tut="TabChild"]',
    content: () => (
      <div style={{ display: "flex", flexDirection: "column", rowGap: "16px" }}>
        <span>
          The Library tab offers a folder area and a file area for managing
          resources.
        </span>
        <div
          style={{ display: "flex", flexDirection: "column", rowGap: "8px" }}
        >
          <span> You can either drag and drop files</span>
          {/* <img src={DndLibraryGif} alt="DndLibraryGif"></img> */}
          <span>Or upload directly from desktop</span>
          {/* <img src={DnDDesktopGif} alt="DnDDesktopGif"></img> */}
        </div>
      </div>
    ),
    action: () => {
      document.getElementById("LibraryTab").click();
    },
  },
  {
    selector: '[data-tut="TabChild"]',
    content: `The Screens tab is where you can manage screens. You can add, remove, and organize them.`,
    action: () => {
      document.getElementById("ScreensTab").click();
    },
  },
  {
    selector: '[data-tut="TabChild"]',
    content: `In the Screen Configuration tab, you can adjust settings such as resolution and name for the selected screen.`,
    action: () => {
      document.getElementById("ScreenConfigTab").click();
    },
  },
  {
    selector: '[data-tut="TabChild"]',
    content: `The Object Configuration tab allows you to modify settings like name, position, and specific properties of the selected object on the canvas.`,
    action: () => {
      document.getElementById("ObjectConfigTab").click();
    },
  },
];

export default function useTutorialHandlers() {
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const handleOpenTutorial = () => {
    setTutorialOpen(true);
  };

  const handleCloseTutorial = () => {
    setTutorialOpen(false);
  };

  return { handleOpenTutorial, handleCloseTutorial, tutorialOpen, tourConfig };
}
