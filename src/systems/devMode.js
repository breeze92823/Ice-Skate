// Opt-in local override (.env.development's VITE_DEV_MODE) for bypassing
// player-facing gates that only exist to protect against a real player
// staring at a broken loading screen — useful when iterating offline or
// against a Bloxity CDN that's down/slow and there's no reason to wait on it.
// Vite only exposes VITE_-prefixed vars, and always as strings.
export const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true'
