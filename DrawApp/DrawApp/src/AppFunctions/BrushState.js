const MIN_BRUSH_SIZE = 1;
const MAX_BRUSH_SIZE = 10;
const MIN_BRUSH_STRENGTH = 0.1;
const MAX_BRUSH_STRENGTH = 1;
const STRENGTH_STEP = 0.1;

let brushSize = MIN_BRUSH_SIZE;
let brushStrength = MAX_BRUSH_STRENGTH;

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
};
