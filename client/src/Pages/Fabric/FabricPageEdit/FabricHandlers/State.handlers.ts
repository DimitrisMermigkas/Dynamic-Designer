import { useEffect, useState } from "react";

const useStateHandlers = ({ canvas }) => {
  const [canvasHistory, setCanvasHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // function to save the current state of the canvas to history
  const saveCanvasState = () => {
    // clone the canvas object so we don't modify the original
    const clonedCanvas = canvas.toJSON();

    // Check if canvas state has changed with respect to previous saved state
    if (
      canvasHistory[historyIndex] &&
      JSON.stringify(clonedCanvas) ===
        JSON.stringify(canvasHistory[historyIndex])
    ) {
      return;
    }

    // add the cloned canvas to our history array
    setCanvasHistory([
      ...canvasHistory.slice(0, historyIndex + 1),
      clonedCanvas,
    ]);

    // increment the history index
    setHistoryIndex(historyIndex + 1);
  };

  const undo = () => {
    if (canUndo()) {
      // decrement the history index
      setHistoryIndex(historyIndex - 1);

      // load the previous state from history into the canvas
      canvas.loadFromJSON(canvasHistory[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (canRedo()) {
      // increment the history index
      setHistoryIndex(historyIndex + 1);

      // load the next state from history into the canvas
      canvas.loadFromJSON(canvasHistory[historyIndex + 1]);
    }
  };

  const canUndo = () => {
    return historyIndex > 0;
  };

  const canRedo = () => {
    return historyIndex < canvasHistory.length - 1;
  };

  useEffect(() => {
    if (canvas) {
      canvas.on("object:added", saveCanvasState);
      canvas.on("object:removed", saveCanvasState);
      canvas.on("object:modified", saveCanvasState);
    }
  }, [canvas]);

  return {
    canUndo,
    canRedo,
    saveCanvasState,
    undo,
    redo,
  };
};
export default useStateHandlers;
