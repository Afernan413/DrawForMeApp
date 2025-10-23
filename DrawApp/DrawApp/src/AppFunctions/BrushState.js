const MIN_BRUSH_SIZE = 1;
const MAX_BRUSH_SIZE = 10;
const MIN_BRUSH_STRENGTH = 0.1;
const MAX_BRUSH_STRENGTH = 1;
const STRENGTH_STEP = 0.1;
const DEFAULT_BACKGROUND_COLOR = "#FFFFFF";

let brushSize = MIN_BRUSH_SIZE;
let brushStrength = MAX_BRUSH_STRENGTH;
let brushColor = "";
let backgroundColor = DEFAULT_BACKGROUND_COLOR;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getBrushSize() {
  return brushSize;
}

function increaseBrushSize() {
  brushSize = clamp(brushSize + 1, MIN_BRUSH_SIZE, MAX_BRUSH_SIZE);
  return brushSize;
}

function decreaseBrushSize() {
  brushSize = clamp(brushSize - 1, MIN_BRUSH_SIZE, MAX_BRUSH_SIZE);
  return brushSize;
}

function resetBrushSize() {
  brushSize = MIN_BRUSH_SIZE;
  return brushSize;
}

function getBrushStrength() {
  return brushStrength;
}

function increaseBrushStrength() {
  brushStrength = clamp(
    Number((brushStrength + STRENGTH_STEP).toFixed(2)),
    MIN_BRUSH_STRENGTH,
    MAX_BRUSH_STRENGTH
  );
  return brushStrength;
}

function decreaseBrushStrength() {
  brushStrength = clamp(
    Number((brushStrength - STRENGTH_STEP).toFixed(2)),
    MIN_BRUSH_STRENGTH,
    MAX_BRUSH_STRENGTH
  );
  return brushStrength;
}

function resetBrushStrength() {
  brushStrength = MAX_BRUSH_STRENGTH;
  return brushStrength;
}

function resetBrush() {
  resetBrushSize();
  resetBrushStrength();
}

function getBrushSizeLabel() {
  const size = getBrushSize();
  return `${size}x${size}`;
}

function getBrushStrengthLabel() {
  return `${Math.round(getBrushStrength() * 100)}%`;
}

function getBrushColor() {
  return brushColor;
}

function setBrushColor(newColor) {
  if (typeof newColor === "string" && newColor.trim().length > 0) {
    brushColor = newColor;
  }
  return brushColor;
}

function resetBrushColor() {
  brushColor = "";
  return brushColor;
}

function getBackgroundColor() {
  return backgroundColor;
}

function setBackgroundColor(newColor) {
  if (typeof newColor === "string" && newColor.trim().length > 0) {
    backgroundColor = newColor;
  }
  return backgroundColor;
}

function resetBackgroundColor() {
  backgroundColor = DEFAULT_BACKGROUND_COLOR;
  return backgroundColor;
}

module.exports = {
  MAX_BRUSH_SIZE,
  MIN_BRUSH_SIZE,
  MIN_BRUSH_STRENGTH,
  MAX_BRUSH_STRENGTH,
  STRENGTH_STEP,
  getBrushSize,
  increaseBrushSize,
  decreaseBrushSize,
  resetBrushSize,
  getBrushStrength,
  increaseBrushStrength,
  decreaseBrushStrength,
  resetBrushStrength,
  resetBrush,
  getBrushSizeLabel,
  getBrushStrengthLabel,
  getBrushColor,
  setBrushColor,
  resetBrushColor,
  getBackgroundColor,
  setBackgroundColor,
  resetBackgroundColor,
  DEFAULT_BACKGROUND_COLOR,
};
