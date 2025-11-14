const MAX_HISTORY = 5;
let history = [];
let index = -1;
let currentBatch = null;

function isCanvasReady(grid) {
  return grid && grid.hasChildNodes();
}

function recordSnapshot(snapshot) {
  if (!snapshot) {
    return;
  }

  if (index < history.length - 1) {
    history = history.slice(0, index + 1);
  }

  if (history.length > 0 && history[history.length - 1] === snapshot) {
    return;
  }

  history.push(snapshot);
  if (history.length > MAX_HISTORY) {
    history = history.slice(history.length - MAX_HISTORY);
  }
  index = history.length - 1;
  return;
}

function captureInitialSnapshot() {
  const grid = document.getElementById("CanvasContainer");
  if (!isCanvasReady(grid)) {
    return;
  }
  if (history.length === 0) {
    recordSnapshot(grid.outerHTML);
  }
  return;
}
function undo() {
  captureInitialSnapshot();
  if (index > 0) {
    index--;
    const previousState = history[index];
    // Restore the previous state
    document.getElementById("CanvasContainer").outerHTML = previousState;
    //update current pixel to be the pixel with pixelCanvas active
    //currentPixel = document.querySelector(".pixelCanvas.active").id.split("-")[1];
    updatePixel()
    //if we undo background color change, we need to update brushState background color
    //update brushState background color
    const grid = document.getElementById("CanvasContainer");
    if (grid) {
      const restoredAttribute = grid.getAttribute("data-background-color");
      if (restoredAttribute && restoredAttribute.trim().length > 0) {
        BrushState.setBackgroundColor(restoredAttribute);
      }
  }
  console.log("Undo performed");
  return;
}
}
function redo() {
  if (index < history.length - 1) {
    index++;
    const nextState = history[index];
    // Restore the next state
    document.getElementById("CanvasContainer").outerHTML = nextState;
    //currentPixel = document.querySelector(".pixelCanvas.active").id.split("-")[1];
    updatePixel()
    //if we undo background color change, we need to update brushState background color
    //update brushState background color
    const grid = document.getElementById("CanvasContainer");
    if (grid) {
      const restoredAttribute = grid.getAttribute("data-background-color");
      if (restoredAttribute && restoredAttribute.trim().length > 0) {
        BrushState.setBackgroundColor(restoredAttribute);
      }
  }
    console.log("Redo performed");
  }
  return;
}



