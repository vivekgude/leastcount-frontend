## Frontend TODO (LeastCount)

Pending tasks only.

### Refactors and composition
- Refactor `pages/game.tsx` to use new building blocks:
  - Hook: `useGameSocket`
  - Components: `OpenPile`, `TimerBadge`, `Scoreboard`, `RoundSummary`, `GameEndBanner`, `ErrorToast`

### UI/UX polish
- Show cumulative scores and eliminated players (use `Scoreboard` fed by `stateupdate.gameScores` and `eliminated`).
- Highlight `currentPlayer` in players list and/or scoreboard.
- Replace inline timer text with `TimerBadge`.

### Error handling
- Replace inline error toast with reusable `ErrorToast` component.

### Validation feedback
- Disable “Drop Selected” button and show hint when multi-select is mixed-rank.

### Tests
- Add unit tests for `utils/cards` (rank checks, filename mapping).
- Add component tests for drop/pick controls gating by `currentPlayer` and `gameState`.

### Optional
- Integrate Redux slice for normalized game state updates from WS events.
- Accessibility pass for focus/ARIA and live regions.


