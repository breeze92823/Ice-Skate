import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { SAHUR_INSTANCES } from '../systems/sahurFollow.js'

// Rigged NPC prop (492 tris, 72-joint Mixamo skeleton, one "Armature|Walk"
// clip). Presentation only — systems/sahurFollow.js owns each instance's
// position/facing/`moving` flag (updated once per frame from
// GameLoop.jsx), same split as systems/giantBallPhysics.js +
// components/GiantBall.jsx. `moving` covers both chasing the player and
// walking back home once they leave that instance's own ground block, so
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
// Two instances are mounted now (Ground.010, Ground.057 — see
// systems/sahurFollow.js's SAHUR_INSTANCES), so the cached glTF scene can't
// be reused directly the way a single instance could — both would fight
// over the same THREE.Object3D. Each instance clones the scene via three's
// SkeletonUtils (a plain Object3D clone doesn't rebuild skinned-mesh bone
// bindings), and gets its own AnimationMixer off that clone while still
// sharing the one loaded AnimationClip array. Materials are kept as
// authored (CLAUDE.md GLTF convention) except when a `tint` is given
// (data/sahurModel.js's SAHUR_MODEL_057) — the Ground.057 instance needs a
// visually distinct color from Ground.010's, so its own material is cloned
// (the cached glTF material is otherwise shared across every instance) and
// its `color` set, which multiplies over the model's single baseColorTexture
// rather than replacing it. That per-instance material is disposed on
// unmount/re-tint, same GPU-resource-cleanup rule as every other prop.
function SahurInstance({ sahur, scale, tint }) {
  const { scene, animations } = useGLTF('/models/sahur_3d.glb')
  const clonedScene = useMemo(() => clone(scene), [scene])
  const { actions } = useAnimations(animations, clonedScene)
  const prevTime = useRef(0)

  useEffect(() => {
    const tinted = []
    clonedScene.traverse((child) => {
      if (child.isMesh || child.isSkinnedMesh) {
        child.castShadow = true
        child.receiveShadow = true
        if (tint) {
          child.material = child.material.clone()
          child.material.color.set(tint)
          tinted.push(child.material)
        }
      }
    })
    return () => {
      tinted.forEach((material) => material.dispose())
    }
  }, [clonedScene, tint])

  useFrame(() => {
    clonedScene.position.set(sahur.position.x, sahur.position.y, sahur.position.z)
    clonedScene.rotation.y = sahur.facing

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

  return <primitive object={clonedScene} scale={scale} />
}

export default function Sahur() {
  return SAHUR_INSTANCES.map(({ sahur, model }, i) => (
    <SahurInstance key={i} sahur={sahur} scale={model.scale} tint={model.tint} />
  ))
}

useGLTF.preload('/models/sahur_3d.glb')
