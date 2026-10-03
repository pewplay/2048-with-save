# 2048 with Save for PewPlay

This directory contains the original static game adapted for the PewPlay game template. Open `index.html` to play.

`game.json` holds the game page text. `preview.png` and `cover.png` provide the page images. The PewPlay workflow checks pushes to `preview` and `main`. The game remains a draft until you remove `"draft": true` after reviewing it.

Game controls: Use the arrow keys to slide all tiles. Matching numbers merge; reach 2048. Use Save and Load to keep a board for later.

## Update (October 2026)

- New responsive layout: the board is sized to fill the window in portrait and landscape (side panel in landscape), no page scroll.
- Touch: swipe anywhere on the screen (Pointer Events, the move fires as soon as the finger has travelled far enough); mouse drag also works.
- Save/Load: the error `alert()` is replaced by an in-page message, save files are validated, a dashed hint appears while dragging a file over the board, dropping a file elsewhere no longer leaves the page.
- Storage keys are now prefixed: `2048-with-save:bestScore`, `2048-with-save:grid` (old unprefixed saves are not imported).
- Removed unused files (old IE font formats, the Light font, the animation-frame polyfill); new cover and screenshots.
