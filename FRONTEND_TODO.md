## Frontend TODO (LeastCount)

Pending tasks only.

### Tests
- Add unit tests for `utils/cards` (rank checks, filename mapping).
- Add component tests for drop/pick controls gating by `currentPlayer` and `gameState`.

### Accessibility and UX polish
- Accessibility pass for focus/ARIA and live regions.
- Replace `<img>` with Next `<Image>` in `components/playercards.tsx` for better LCP (adjust sizes).

### Optional state management
- Integrate Redux slice for normalized game state updates from WS events.


