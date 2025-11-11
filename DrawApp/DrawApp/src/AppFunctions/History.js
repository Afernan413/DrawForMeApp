let history = [];
//max history of 5 states
const MAX_HISTORY = 5;
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
  //if mutationList includes style or child changes, push to history
  if(Array.from(mutationsList).some(mutation => mutation.attributeName === "style" || mutation.addedNodes.length > 0)) {
    console.log("Grid changed");
    //if at max history, remove oldest
    if (history.length >= MAX_HISTORY) {
      history.shift();
      history.push(currentBatch);
    }
    else{
      history.push(currentBatch);
    index++;
    }
    
  }
}

//on grid change, push the current grid html to history
function logChanges(mutationsList, observer) {
  for (const mutation of mutationsList) {
    if (mutation.attributeName === "canvastype" || mutation.attributeName === "background-color") {
      history.push(document.getElementById("CanvasContainer").outerHTML);
      console.log("Canvas Type Changed");
      const pixels = document.getElementsByClassName("pixelCanvas");
      if (pixels) {
        console.log("Observing individual pixels for changes");
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
