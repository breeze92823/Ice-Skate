import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { sahur } from '../systems/sahurFollow.js'
import { SAHUR_MODEL } from '../data/sahurModel.js'

// Rigged NPC prop (492 tris, 72-joint Mixamo skeleton, one "Armature|Walk"
// clip). Presentation only — systems/sahurFollow.js owns position/facing/
// the `moving` flag (updated once per frame from GameLoop.jsx), same split
// as systems/giantBallPhysics.js + GiantBall.jsx. `moving` covers both
// chasing the player and walking back home once they leave Ground.010, so
// the walk clip stays active for the whole trip, not just the chase. Its
// play state is resynced every frame (not just on change), so it's always
// active exactly while moving and never drifts out of sync with a remount
// or a same-frame toggle.
//
// Arriving home (or the player leaving mid-chase) doesn't freeze the clip
// wherever it happens to be mid-stride — it keeps playing until
// AnimationMixer wraps its time back past 0 (one full loop's worth of
// LoopRepeat), then pauses exactly at the clip's start pose. Detected by
// watching action.time decrease frame over frame, since that's what a loop
// wrap looks like.
//
// Only one instance is ever mounted, so the cached glTF scene is used
// directly rather than cloned — cloning a skinned mesh needs
// THREE.SkeletonUtils.clone to rebuild bone bindings correctly, which isn't
// worth it when nothing else loads this same GLTF. Materials are kept as
// authored (CLAUDE.md GLTF convention) since there's no visual reason to
// override them.
export default function Sahur() {
  const { scene, animations } = useGLTF('/models/sahur_3d.glb')
  const { actions } = useAnimations(animations, scene)
  const prevTime = useRef(0)

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh || child.isSkinnedMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [scene])

  useFrame(() => {
    scene.position.set(sahur.position.x, sahur.position.y, sahur.position.z)
    scene.rotation.y = sahur.facing

    const action = actions['Armature|Walk']
    if (!action) return

    if (sahur.moving) {
      if (!action.isRunning()) action.play()
      action.paused = false
    } else if (!action.paused) {
      // Still mid-stride from before `moving` went false — let it keep
      // running until the loop wraps back to the start, then pause there.
      if (action.time < prevTime.current) {
        action.time = 0
        action.paused = true
      }
    }

    prevTime.current = action.time
  })

  return <primitive object={scene} scale={SAHUR_MODEL.scale} />
}

useGLTF.preload('/models/sahur_3d.glb')
