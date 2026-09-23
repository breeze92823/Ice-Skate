import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping, PCFSoftShadowMap, SRGBColorSpace } from 'three'
import GameLoop from './components/GameLoop.jsx'
import Water from './components/Water.jsx'
import Ground from './components/Ground.jsx'
import GroundBlocks from './components/GroundBlocks.jsx'
import SlopeBlock from './components/SlopeBlock.jsx'
import HubWalls from './components/HubWalls.jsx'
import SideWalls from './components/SideWalls.jsx'
import Stage2Walls from './components/Stage2Walls.jsx'
import Stage3Walls from './components/Stage3Walls.jsx'
import Stage4Walls from './components/Stage4Walls.jsx'
import Stage5Walls from './components/Stage5Walls.jsx'
import Stage6Walls from './components/Stage6Walls.jsx'
import Stage7Walls from './components/Stage7Walls.jsx'
import Stage8Walls from './components/Stage8Walls.jsx'
import Stage9Walls from './components/Stage9Walls.jsx'
import Stage10Walls from './components/Stage10Walls.jsx'
import Stage11Walls from './components/Stage11Walls.jsx'
import Stage12Walls from './components/Stage12Walls.jsx'
import StageWalls from './components/StageWalls.jsx'
import Hammer from './components/Hammer.jsx'
import CrusherWalls from './components/CrusherWalls.jsx'
import RampBlock from './components/RampBlock.jsx'
import Road from './components/Road.jsx'
import Player from './components/Player.jsx'
import Treadmills from './components/Treadmills.jsx'
import LeaderboardSigns from './components/LeaderboardSigns.jsx'
import SkateRack from './components/SkateRack.jsx'
import IceSkateShoes from './components/IceSkateShoes.jsx'
import TeleportGate from './components/TeleportGate.jsx'
import GiantBall from './components/GiantBall.jsx'
import Sahur from './components/Sahur.jsx'
import GlowFloorPanels from './components/GlowFloorPanels.jsx'
import Hud from './components/hud/Hud.jsx'

export default function App() {
  return (
    <>
      <Canvas
        shadows={{ type: PCFSoftShadowMap }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          outputColorSpace: SRGBColorSpace,
        }}
        camera={{ fov: 55, near: 0.1, far: 200, position: [0, 6, 12] }}
      >
        <color attach="background" args={['#bcdcff']} />
        <hemisphereLight args={['#eaf3ff', '#b7a98f', 1.1]} />
        <directionalLight
          position={[30, 45, 20]}
          intensity={2.3}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-45}
          shadow-camera-right={45}
          shadow-camera-top={45}
          shadow-camera-bottom={-45}
          shadow-camera-near={1}
          shadow-camera-far={160}
          shadow-bias={-0.0004}
          shadow-normalBias={0.04}
        />

        <GameLoop />
        <Water />
        <Suspense fallback={null}>
          <Ground />
          <GroundBlocks />
          <SlopeBlock />
          <Sahur />
          <GlowFloorPanels />
          <Hammer />
          <CrusherWalls />
          <RampBlock />
        </Suspense>
        <Road />
        <Player />
        <Treadmills />
        <SkateRack />
        <IceSkateShoes />
        <LeaderboardSigns />
        <TeleportGate />
        <GiantBall />
        <HubWalls />
        <SideWalls />
        <Stage2Walls />
        <Stage3Walls />
        <Stage4Walls />
        <Stage5Walls />
        <Stage6Walls />
        <Stage7Walls />
        <Stage8Walls />
        <Stage9Walls />
        <Stage10Walls />
        <Stage11Walls />
        <Stage12Walls />
        <StageWalls />
      </Canvas>
      <Hud />
    </>
  )
}
