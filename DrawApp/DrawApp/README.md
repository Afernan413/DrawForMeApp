# DrawApp Change Log

This document tracks feature additions and implementation details as they roll into the project.

## October 2025 – Brush System Enhancements

- Added a shared `BrushState` module (`src/AppFunctions/BrushState.js`) that centralizes brush size and opacity, exposes reset helpers, and clamps values.
- Wired brush controls through the renderer so `refreshBrushUI()` keeps the preview square and stats text in sync after any adjustment.
- Introduced solid-brush square footprint logic across `FillPixel` and `GridNavigation`, ensuring even-sized brushes (2×2, 4×4, etc.) paint and preview accurately around the active pixel.
- Updated UI elements (`index.html`, `styles/index.css`) to add a brush preview square, stats panel, and square outline styling that matches the active pixel border.
- Cleaned up button flows (`SetButtons.js`) to expose a brush menu for size/opacity tweaks while keeping color tools focused on brush operations.
- Generated `docs/brush-implementation.pdf` summarizing the architecture, customization points, and future enhancement ideas for the brush system.

> _Next updates will be appended here as new features land; let me know when you want to record additional changes._
