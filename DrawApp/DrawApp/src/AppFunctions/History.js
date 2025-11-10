const MAX_HISTORY = 150;
let history = [];
let index = -1;
let currentBatch = null;

function getGridHTML() {
  const grid = document.getElementById("CanvasContainer");
  if (grid.hasAttribute("canvastype")) {
    currentBatch = grid.outerHTML;
  } else currentBatch = null;
}

//on grid change, push the current grid html to history
function logChanges(mutationsList, observer) {
  console.log("Grid changed, logging history");
  console.log(mutationsList);
  getGridHTML();
  if(currentBatch !== null) {
    history.push(currentBatch);
    index++;
}
}
const observerOptions = {
  attributes: true,
  attributeFilter: ['class', 'style'],
  characterData: true, // detect text/innerHTML changes
  childList: true,
  subtree: false,
};

const observer = new MutationObserver(logChanges);

const canvasEl = document.getElementById("CanvasContainer");
observer.observe(canvasEl, observerOptions);
