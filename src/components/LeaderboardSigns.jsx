import LeaderboardSign from './LeaderboardSign.jsx'
import { LEADERBOARD_INSTANCES } from '../data/leaderboard.js'

// A row of leaderboard standees (data/leaderboard.js's LEADERBOARD_INSTANCES)
// — one per tracked stat (Speed/Wins/Most Time), each its own position/title/
// color but sharing the same shape/tabs/roster — mapped so adding another
// instance there needs no changes here, same pattern as Treadmills.jsx over
// data/treadmill.js.
export default function LeaderboardSigns() {
  return (
    <>
      {LEADERBOARD_INSTANCES.map((instance) => (
        <LeaderboardSign
          key={instance.name}
          position={instance.position}
          rotationY={instance.rotationY}
          scale={instance.scale}
          title={instance.title}
          color={instance.color}
          stat={instance.stat}
        />
      ))}
    </>
  )
}
