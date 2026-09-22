import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping, PCFSoftShadowMap, SRGBColorSpace } from 'three'
import GameLoop from './components/GameLoop.jsx'
import Water from './components/Water.jsx'
import Ground from './components/Ground.jsx'
import GroundBlocks from './components/GroundBlocks.jsx'
import SlopeBlock from './components/SlopeBlock.jsx'
import Road from './components/Road.jsx'
import Player from './components/Player.jsx'
import Treadmill from './components/Treadmill.jsx'
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
        </Suspense>
        <Road />
        <Player />
        <Treadmill />
        <TeleportGate />
        <GiantBall />
      </Canvas>
      <Hud />
    </>
  )
}
