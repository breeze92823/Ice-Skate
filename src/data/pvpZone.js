// This project has no PVP zone yet. Kept as a real module (rather than
// inlining the check at each call site) so components/hud/LevelBar.jsx and
// systems/playerHealth.js need no changes the day a zone is added — swap
// this for the real bounds check then.
export function isInPvpZone() {
  return false
}
