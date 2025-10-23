# DrawApp Change Log

This document tracks feature additions and implementation details as they roll into the project.

## October 2025 – Brush System Enhancements

- Added a shared `BrushState` module (`src/AppFunctions/BrushState.js`) that centralizes brush size and opacity, exposes reset helpers, and clamps values.
- Wired brush controls through the renderer so `refreshBrushUI()` keeps the preview square and stats text in sync after any adjustment.
- Introduced solid-brush square footprint logic across `FillPixel` and `GridNavigation`, ensuring even-sized brushes (2×2, 4×4, etc.) paint and preview accurately around the active pixel.
- Updated UI elements (`index.html`, `styles/index.css`) to add a brush preview square, stats panel, and square outline styling that matches the active pixel border.
- Cleaned up button flows (`SetButtons.js`) to expose a brush menu for size/opacity tweaks while keeping color tools focused on brush operations.
- Cleaned up the active pixel outline
- Text is now typed without effecting pixel color and different opacity fills will not effect letters/shapes
  > TODO
  - Choose background color
    - have it so you can pick a color and then it makes the entire background that  color for the piece you're working on
  - MS Paint "Fill" effect aka the old "bucket" effect
    - a color is filled in within a shape, AKA if you make a square, it will fill in the square
  - Undo button
    - when I made a mistake, I would have to reapply the color. I was thinking it might be easier to have an Undo button that's easy to access
  - Make line
    - set two points of a line and it fills in the line with a specified color
  - Type bigger on the buttons
    - the on screen buttons are small, it's too small
 
## UI flow update (Oct 21, 2025)

- The "More" -> "Change Brush" flow was simplified into a single top-level Change Brush menu with these entries: Change Color, Change Size, Change Opacity, Standard, Eraser, Go Back.
- "Change Opacity" now opens the dedicated opacity controls (Increase/Decrease/Reset) via the Brush Strength screen.
- "Standard" resets brush size and opacity to defaults and returns the user to the main navigation (instead of opening the brush menu).

This change removes the previous redundant ChangeColorFromChangeBrush path and unifies the palette/brush behavior.

## Background Color & Eraser Enhancements (Oct 23, 2025)

- Added background color memory to `BrushState` and applied it during canvas resets/initialization so sessions remember the selected background.
- Implemented a "Change Background" flow under the More menu: palette picks now drill into dedicated background selections before applying across untouched pixels.
- Updated the eraser to sync with the background color, display a custom icon in the brush preview, and hide the opacity readout in the stats panel when active.
- While erasing, opacity controls are disabled and hidden across button flows (Change Brush, Brush Menu, Select Color More, Brush Strength) to avoid confusing state changes.
- Persisted the chosen background in the canvas HTML (`data-background-color` attribute) so saved projects reopen with the exact background instead of resetting to white.