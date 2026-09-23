import { Text } from '@react-three/drei'
import { MATERIAL_PBR } from '../data/materials.js'
import { formatShort } from '../data/format.js'
import { LEADERBOARD_SHAPE, LEADERBOARD_TABS, LEADERBOARD_ENTRIES } from '../data/leaderboard.js'

// "SPEED — Global Leaderboard" standee near the treadmill row — a scoreboard
// on a monitor-style stand, same "bezel box + inset face plane + drei Text"
// construction as SkateRackSign.jsx, just larger and holding a tab row plus
// a ranked list instead of one title line. Decorative only, no live data —
// LEADERBOARD_ENTRIES in data/leaderboard.js is a fixed fictional roster,
// shared by every instance (LeaderboardSigns.jsx maps data/leaderboard.js's
// LEADERBOARD_INSTANCES over position/rotationY/scale, same split as
// TreadmillProp.jsx/Treadmills.jsx).
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

const FACE_Z = BOARD_T / 2 + 0.005
const TEXT_Z = BOARD_T / 2 + 0.03
const TAB_Z = BOARD_T / 2 + 0.02

export default function LeaderboardSign({ position, rotationY, scale, title, color }) {
  const boardCenterY = FOOT_H + POST_H + BOARD_H / 2

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

        {/* Ranked rows, mapped from data/leaderboard.js's LEADERBOARD_ENTRIES
            so extending the roster needs no changes here. */}
        {LEADERBOARD_ENTRIES.map((entry, i) => {
          const y = ROW_START_Y - i * ROW_STEP_Y
          return (
            <group key={entry.name} position={[0, y, 0]}>
              <Text
                position={[RANK_X, 0, TEXT_Z]}
                fontSize={0.18}
                fontWeight="bold"
                color={entry.rankColor}
                outlineWidth={0.015}
                outlineColor="#000000"
                anchorX="center"
                anchorY="middle"
              >
                {`#${entry.rank}`}
              </Text>
              <mesh position={[AVATAR_X, 0, TEXT_Z]} castShadow={false}>
                <boxGeometry args={[AVATAR_SIZE, AVATAR_SIZE, 0.03]} />
                <meshStandardMaterial color={entry.avatarColor} {...MATERIAL_PBR.LEADERBOARD_FACE} />
              </mesh>
              <Text
                position={[NAME_X, 0, TEXT_Z]}
                fontSize={0.16}
                fontWeight="bold"
                color="#e9edf1"
                outlineWidth={0.015}
                outlineColor="#000000"
                anchorX="left"
                anchorY="middle"
              >
                {entry.name}
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
                {formatShort(entry.speed)}
              </Text>
            </group>
          )
        })}
      </group>
    </group>
  )
}
