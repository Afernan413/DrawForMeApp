const MAX_HISTORY = 150;
let history = [];
let index = 0;
let currentBatch = null;

function undo() {
  if (index > 0) {
    index--;
    const previousState = history[index];
    // Restore the previous state
    document.getElementById("CanvasContainer").outerHTML = previousState;
    console.log("Undo performed");
  }
}
function redo() {
  if (index < history.length - 1) {
    index++;
    const nextState = history[index];
    // Restore the next state
    document.getElementById("CanvasContainer").outerHTML = nextState;
    console.log("Redo performed");
  }
}
function getGridHTML(mutationsList, observer) {
  const grid = document.getElementById("CanvasContainer");
  if (grid.hasAttribute("canvastype")) {
    currentBatch = grid.outerHTML;
  } else currentBatch = null;
  for (const mutation of mutationsList) {
    if (mutation.attributeName === "style") {
      // only log after canvas is fully loaded
      if (document.readyState === "complete") {
        console.log("Pixel style changed");
        history.push(currentBatch);
        index++;
      }
    }
    if (mutation.addedNodes.length === 1) {
      //only log if one node added (to avoid multiple logs on bulk additions)
      if (mutation.addedNodes[0]) {
        console.log("Pixel children changed");
        history.push(currentBatch);
        index++;
      }
    }
  }
}

//on grid change, push the current grid html to history
function logChanges(mutationsList, observer) {
  for (const mutation of mutationsList) {
    if (mutation.attributeName === "canvastype") {
      history.push(document.getElementById("CanvasContainer").outerHTML);
      console.log("Canvas Type Changed");
      const pixels = document.getElementsByClassName("pixelCanvas");
      if (pixels) {
        Array.from(pixels).forEach((pixel) => {
          //observe all pixels for changes
          observer2.observe(pixel, observerOptions);
        });
      }
    }
  }
}
const observerOptions = {
  attributes: true,
  characterData: true, // detect text/innerHTML changes
  childList: true,
  subtree: true,
};

const observer = new MutationObserver(logChanges);
const observer2 = new MutationObserver(getGridHTML);
const canvasEl = document.getElementById("CanvasContainer");
observer.observe(canvasEl, observerOptions);
