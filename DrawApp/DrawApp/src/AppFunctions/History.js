const MAX_HISTORY = 150;
let history = [];
let index = -1;
let currentBatch = null;

function getGridHTML() {
  const grid = document.getElementById("CanvasContainer");
  if (grid.hasAttribute("canvastype")) {
    return grid.innerHTML;
  } else return;
}

//on grid change, push the current grid html to history
function logChanges() {
  if (getGridHTML()) {
    history.push(getGridHTML());
    index++;
  }
}
// Observe a variety of DOM changes so we capture pixel updates which may
// come from innerHTML/text changes, attribute changes (style/class), or
// node additions/removals. We watch subtree so changes to individual
// `.pixelCanvas` children are observed.
const observerOptions = {
  childList: true, // detect added/removed pixel nodes
  attributes: true, // detect style/class changes on pixel nodes
  attributeOldValue: true,
  attributeFilter: ["style", "class", "data-background-color"],
  characterData: true, // detect changes to text nodes inside pixels
  characterDataOldValue: true,
  subtree: true, // watch the whole grid subtree
};

const observer = new MutationObserver(logChanges);

const canvasEl = document.getElementById("CanvasContainer");
if (canvasEl) {
  observer.observe(canvasEl, observerOptions);
} else {
  // If the grid isn't present yet (startup timing), try to observe later.
  window.addEventListener(
    "DOMContentLoaded",
    () => {
      const el = document.getElementById("CanvasContainer");
      if (el) observer.observe(el, observerOptions);
    },
    { once: true }
  );
}
