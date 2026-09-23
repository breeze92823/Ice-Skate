import { useEffect, useReducer } from 'react'
import { Text } from '@react-three/drei'
import { MATERIAL_PBR } from '../data/materials.js'
import { formatShort, formatDuration } from '../data/format.js'
import { useGameStore } from '../store/useGameStore.js'
import { getLeaderboard, subscribe as subscribeNet } from '../systems/net.js'
import {
  LEADERBOARD_SHAPE,
  LEADERBOARD_TABS,
  LEADERBOARD_ENTRIES,
  rankColorFor,
  LEADERBOARD_SELF_NAME_COLOR,
  LEADERBOARD_SELF_ROW_COLOR,
} from '../data/leaderboard.js'

// "SPEED — Global Leaderboard" standee near the treadmill row — a scoreboard
// on a monitor-style stand, same "bezel box + inset face plane + drei Text"
// construction as SkateRackSign.jsx, just larger and holding a tab row plus
// a ranked list instead of one title line. LeaderboardSigns.jsx maps data/
// leaderboard.js's LEADERBOARD_INSTANCES over position/rotationY/scale/
// title/color/stat, same split as TreadmillProp.jsx/Treadmills.jsx.
//
// `stat` (e.g. 'speed'/'wins'/'timePlayed') makes this board LIVE: rows come
// from systems/net.js's getLeaderboard(stat, limit) — our own row straight
// off the live store, every other row from whichever players are currently
// online/saved — same source the HUD's own net status reads. All three
// boards pass a `stat` today (data/leaderboard.js's METRICS); `stat === null`
// is kept as a fallback to the fixed LEADERBOARD_ENTRIES roster in case a
// future board tracks something with no live field. Our own row (`isSelf`)
// gets both a tinted name (LEADERBOARD_SELF_NAME_COLOR) and a full-row
// highlight stripe (LEADERBOARD_SELF_ROW_COLOR) so "that's you" reads at a
// glance on every board, not just the name color.
function useNetRoster(active) {
  const [, bump] = useReducer((n) => n + 1, 0)
  useEffect(() => {
    if (!active) return undefined
    return subscribeNet(() => bump())
  }, [active])
}
const {
  boardWidth: BOARD_W,
  boardHeight: BOARD_H,
  boardThick: BOARD_T,
  footWidth: FOOT_W,
  footHeight: FOOT_H,
  footDepth: FOOT_D,
  postWidth: POST_W,
  postHeight: POST_H,
} = LEADERBOARD_SHAPE

const BOARD_COLOR = '#1a1c22'
const FACE_COLOR = '#121a33'

const SPIKE_COUNT = 9
const SPIKE_SIZE = 0.22
const SPIKE_SPAN = BOARD_W * 0.88

const TITLE_Y = BOARD_H / 2 - 0.42
const SUBTITLE_Y = BOARD_H / 2 - 0.8
const TABS_Y = BOARD_H / 2 - 1.14
const TAB_STEP_X = 0.75
const TAB_W = 0.62
const TAB_H = 0.24

const ROW_START_Y = BOARD_H / 2 - 1.55
const ROW_STEP_Y = 0.34
const RANK_X = -1.2
const AVATAR_X = -0.92
const NAME_X = -0.76
const VALUE_X = 1.35
const AVATAR_SIZE = 0.2

// Self row's highlight stripe — wide/tall enough to sit behind the rank,
// name and value text of that one row (RANK_X..VALUE_X's own span), not the
// full board width.
const ROW_HILITE_WIDTH = 2.86
const ROW_HILITE_X = 0.08
const ROW_HILITE_HEIGHT = ROW_STEP_Y * 0.86

const FACE_Z = BOARD_T / 2 + 0.005
const TEXT_Z = BOARD_T / 2 + 0.03
const TAB_Z = BOARD_T / 2 + 0.02

// How many ranked rows this board draws at once — matches the fixed
// ENTRIES roster's own length, which is what ROW_START_Y/ROW_STEP_Y above
// were sized for. A live board (stat != null) fetches at most this many rows
// from systems/net.js's getLeaderboard(); fewer players online just leaves
// the remaining slots undrawn rather than resizing the board.
const VISIBLE_ROWS = LEADERBOARD_ENTRIES.length

export default function LeaderboardSign({ position, rotationY, scale, title, color, stat }) {
  const boardCenterY = FOOT_H + POST_H + BOARD_H / 2

  // Hook order must stay identical across renders (stat is a fixed prop per
  // instance, never toggles), so both are called unconditionally; each
  // no-ops internally when this board has no live stat.
  useNetRoster(!!stat)
  useGameStore((s) => (stat ? s[stat] : 0))

  // Normalize both sources (live net rows vs. the fixed dummy roster) into
  // one row shape so the JSX below renders either without branching per
  // field. `avatarColor` stays null for live rows — no such data exists on
  // systems/net.js's getLeaderboard() rows — so the avatar swatch mesh below
  // just doesn't draw for those, same as Laser-Escape's live LeaderboardBoard.
  // `timePlayed` (systems/playTime.js) is seconds, not a plain magnitude —
  // formatDuration reads "2h 15m" instead of formatShort's "2.15K".
  const formatValue = stat === 'timePlayed' ? formatDuration : formatShort
  const rows = stat
    ? getLeaderboard(stat, VISIBLE_ROWS).map((row, i) => ({
        key: row.id,
        rank: i + 1,
        rankColor: rankColorFor(i + 1),
        name: row.name,
        nameColor: row.isSelf ? LEADERBOARD_SELF_NAME_COLOR : '#e9edf1',
        valueText: formatValue(row.value),
        avatarColor: null,
        isSelf: row.isSelf,
      }))
    : LEADERBOARD_ENTRIES.map((entry) => ({
        key: entry.name,
        rank: entry.rank,
        rankColor: entry.rankColor,
        name: entry.name,
        nameColor: '#e9edf1',
        valueText: formatShort(entry.speed),
        avatarColor: entry.avatarColor,
        isSelf: false,
      }))

  return (
    <group position={position} rotation-y={rotationY} scale={scale}>
      {/* Foot + post, monitor-stand style, same as TreadmillProp's console arms */}
      <mesh position={[0, FOOT_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[FOOT_W, FOOT_H, FOOT_D]} />
        <meshStandardMaterial color="#3a3f48" {...MATERIAL_PBR.LEADERBOARD_STAND} />
      </mesh>
      <mesh position={[0, FOOT_H + POST_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[POST_W, POST_H, POST_W]} />
        <meshStandardMaterial color="#3a3f48" {...MATERIAL_PBR.LEADERBOARD_STAND} />
      </mesh>

      {/* Board, faces +Z toward the approaching player — same convention as
          SkateRackSign.jsx/TreadmillProp's console screen. */}
      <group position={[0, boardCenterY, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[BOARD_W, BOARD_H, BOARD_T]} />
          <meshStandardMaterial color={BOARD_COLOR} {...MATERIAL_PBR.LEADERBOARD_BOARD} />
        </mesh>
        <mesh position={[0, 0, FACE_Z]} castShadow={false}>
          <planeGeometry args={[BOARD_W * 0.92, BOARD_H * 0.94]} />
          <meshStandardMaterial color={FACE_COLOR} {...MATERIAL_PBR.LEADERBOARD_FACE} />
        </mesh>

        {/* Crenellation trim: a picture-frame border plus a row of diamond
            "crown" spikes along the top edge, styled after the reference
            mock's red thorn border — tinted per-instance (`color`, e.g. the
            Speed board's red) so the row of boards read apart at a glance. */}
        <mesh position={[0, BOARD_H / 2 + 0.02, BOARD_T / 4]} castShadow receiveShadow>
          <boxGeometry args={[BOARD_W + 0.16, 0.12, BOARD_T * 0.9]} />
          <meshStandardMaterial color={color} {...MATERIAL_PBR.LEADERBOARD_TRIM} />
        </mesh>
        <mesh position={[0, -BOARD_H / 2 - 0.02, BOARD_T / 4]} castShadow receiveShadow>
          <boxGeometry args={[BOARD_W + 0.16, 0.12, BOARD_T * 0.9]} />
          <meshStandardMaterial color={color} {...MATERIAL_PBR.LEADERBOARD_TRIM} />
        </mesh>
        {[-1, 1].map((sign) => (
          <mesh key={sign} position={[sign * (BOARD_W / 2 + 0.02), 0, BOARD_T / 4]} castShadow receiveShadow>
            <boxGeometry args={[0.12, BOARD_H + 0.16, BOARD_T * 0.9]} />
            <meshStandardMaterial color={color} {...MATERIAL_PBR.LEADERBOARD_TRIM} />
          </mesh>
        ))}
        {Array.from({ length: SPIKE_COUNT }, (_, i) => {
          const x = -SPIKE_SPAN / 2 + (SPIKE_SPAN / (SPIKE_COUNT - 1)) * i
          return (
            <mesh
              key={i}
              position={[x, BOARD_H / 2 + 0.08 + SPIKE_SIZE / 2, BOARD_T / 4]}
              rotation-z={Math.PI / 4}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[SPIKE_SIZE, SPIKE_SIZE, BOARD_T * 0.7]} />
              <meshStandardMaterial color={color} {...MATERIAL_PBR.LEADERBOARD_TRIM} />
            </mesh>
          )
        })}

        <Text
          position={[0, TITLE_Y, TEXT_Z]}
          fontSize={0.52}
          fontWeight="bold"
          letterSpacing={0.02}
          color={color}
          outlineWidth={0.05}
          outlineColor="#000000"
          anchorX="center"
          anchorY="middle"
        >
          {title}
        </Text>
        <Text
          position={[0, SUBTITLE_Y, TEXT_Z]}
          fontSize={0.2}
          fontWeight="bold"
          letterSpacing={0.01}
          color="#e9edf1"
          outlineWidth={0.02}
          outlineColor="#000000"
          anchorX="center"
          anchorY="middle"
        >
          Global Leaderboard
        </Text>

        {/* Tab filters — decorative only, "All" shown selected like the
            reference mock. */}
        {LEADERBOARD_TABS.map((tab, i) => {
          const x = (i - (LEADERBOARD_TABS.length - 1) / 2) * TAB_STEP_X
          return (
            <group key={tab.label} position={[x, TABS_Y, 0]}>
              <mesh position={[0, 0, TAB_Z]} castShadow={false}>
                <boxGeometry args={[TAB_W, TAB_H, 0.03]} />
                <meshStandardMaterial
                  color={tab.color}
                  opacity={tab.selected ? 1 : 0.85}
                  transparent={!tab.selected}
                  {...MATERIAL_PBR.LEADERBOARD_FACE}
                />
              </mesh>
              <Text
                position={[0, 0, TAB_Z + 0.02]}
                fontSize={0.13}
                fontWeight="bold"
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                {tab.label}
              </Text>
            </group>
          )
        })}

        {/* Ranked rows — `rows` above already normalized live (stat != null)
            vs. dummy (data/leaderboard.js's LEADERBOARD_ENTRIES) into one
            shape, so this map never branches on which source it came from. */}
        {rows.map((row, i) => {
          const y = ROW_START_Y - i * ROW_STEP_Y
          const nameX = row.avatarColor ? NAME_X : AVATAR_X
          return (
            <group key={row.key} position={[0, y, 0]}>
              {row.isSelf && (
                <mesh position={[ROW_HILITE_X, 0, FACE_Z + 0.005]} castShadow={false}>
                  <planeGeometry args={[ROW_HILITE_WIDTH, ROW_HILITE_HEIGHT]} />
                  <meshBasicMaterial color={LEADERBOARD_SELF_ROW_COLOR} transparent opacity={0.28} toneMapped={false} />
                </mesh>
              )}
              <Text
                position={[RANK_X, 0, TEXT_Z]}
                fontSize={0.18}
                fontWeight="bold"
                color={row.rankColor}
                outlineWidth={0.015}
                outlineColor="#000000"
                anchorX="center"
                anchorY="middle"
              >
                {`#${row.rank}`}
              </Text>
              {row.avatarColor && (
                <mesh position={[AVATAR_X, 0, TEXT_Z]} castShadow={false}>
                  <boxGeometry args={[AVATAR_SIZE, AVATAR_SIZE, 0.03]} />
                  <meshStandardMaterial color={row.avatarColor} {...MATERIAL_PBR.LEADERBOARD_FACE} />
                </mesh>
              )}
              <Text
                position={[nameX, 0, TEXT_Z]}
                fontSize={0.16}
                fontWeight="bold"
                color={row.nameColor}
                outlineWidth={0.015}
                outlineColor="#000000"
                anchorX="left"
                anchorY="middle"
              >
                {row.name}
              </Text>
              <Text
                position={[VALUE_X, 0, TEXT_Z]}
                fontSize={0.16}
                fontWeight="bold"
                color="#ff9a1e"
                outlineWidth={0.015}
                outlineColor="#000000"
                anchorX="right"
                anchorY="middle"
              >
                {row.valueText}
              </Text>
            </group>
          )
        })}
      </group>
    </group>
  )
}
