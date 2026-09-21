// Builds a three.js avatar from the player's equipped Bloxity cosmetics.
//
// Every cosmetic slot is remote and optional: any part/item/skin that 404s
// or fails to parse falls back to the base rig's own default_* mesh. The
// base rig itself retries with backoff rather than giving up, so a blocked
// CDN only ever leaves the caller on the capsule temporarily.
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import {
  AVATAR_SLOTS,
  BASE_MODEL_URL,
  RIG,
  RIG_HEIGHT,
  isEquipped,
  itemUrls,
  partUrl,
  skinUrl,
} from '../data/bloxity.js'
import { PLAYER_HEIGHT, PLAYER_RADIUS } from './playerState.js'
import { MATERIAL_PBR } from '../data/materials.js'

// The base rig is refetched on every rebuild; let three serve it from cache.
THREE.Cache.enabled = true

const gltfLoader = new GLTFLoader()
const objLoader = new OBJLoader()
const textureLoader = new THREE.TextureLoader()

// A blip on the base-rig fetch must not permanently strand the player:
// retry with growing backoff instead of giving up after one failure.
const BASE_RIG_RETRY_BACKOFF_MS = [2_000, 5_000, 10_000, 20_000, 30_000]

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// `token.cancelled` flips true when a newer rebuild supersedes this one or
// the component unmounts (PlayerAvatar.jsx) — checked between attempts so an
// abandoned retry loop can't outlive its caller.
async function loadBaseRig(token) {
  let attempt = 0
  for (;;) {
    if (token?.cancelled) return null
    try {
      return await gltfLoader.loadAsync(BASE_MODEL_URL)
    } catch (err) {
      const delay = BASE_RIG_RETRY_BACKOFF_MS[Math.min(attempt, BASE_RIG_RETRY_BACKOFF_MS.length - 1)]
      attempt += 1
      console.warn(`[bloxity] base rig load failed (attempt ${attempt}), retrying in ${delay}ms`, err)
      await wait(delay)
    }
  }
}

// Remote glTFs arrive as MeshStandardMaterial. Every loaded material is
// rebuilt fresh (so it can be owned/disposed independently of the loader's
// own instance), passing the source's real PBR channels through.
function toStandard(material, owned) {
  const source = Array.isArray(material) ? material[0] : material
  const standard = new THREE.MeshStandardMaterial({
    map: source && source.map ? source.map : null,
    color: source && source.color ? source.color.clone() : new THREE.Color(0xffffff),
    side: source && source.side !== undefined ? source.side : THREE.FrontSide,
    transparent: !!(source && source.transparent),
    alphaTest: source && source.alphaTest ? source.alphaTest : 0,
    roughness: source && source.roughness !== undefined ? source.roughness : MATERIAL_PBR.AVATAR_DEFAULT.roughness,
    metalness: source && source.metalness !== undefined ? source.metalness : MATERIAL_PBR.AVATAR_DEFAULT.metalness,
    normalMap: source && source.normalMap ? source.normalMap : null,
    roughnessMap: source && source.roughnessMap ? source.roughnessMap : null,
    metalnessMap: source && source.metalnessMap ? source.metalnessMap : null,
  })
  owned.materials.push(standard)
  return standard
}

function convertMaterials(object3d, owned) {
  object3d.traverse((o) => {
    if (!o.isMesh && !o.isSkinnedMesh) return
    const previous = o.material
    const source = Array.isArray(previous) ? previous[0] : previous
    const key = source ? source.uuid : 'none'
    // Meshes that shared a source material must keep sharing one after the
    // swap — the base rig's six body meshes all use a single `char` material.
    let standard = owned.converted.get(key)
    if (!standard) {
      standard = toStandard(previous, owned)
      owned.converted.set(key, standard)
    }
    o.material = standard
    o.castShadow = true
    o.receiveShadow = false
    for (const m of Array.isArray(previous) ? previous : [previous]) {
      if (m && m !== o.material) m.dispose()
    }
  })
}

// Skins are pixel art (the base rig samples NEAREST) and glTF UVs are not
// flipped, so a plain PNG has to match that convention explicitly.
function configureSkinTexture(texture) {
  texture.flipY = false
  texture.colorSpace = THREE.SRGBColorSpace
  texture.magFilter = THREE.NearestFilter
  texture.minFilter = THREE.NearestMipmapLinearFilter
  texture.anisotropy = 1
  return texture
}

function configureItemTexture(texture) {
  texture.colorSpace = THREE.SRGBColorSpace
  texture.magFilter = THREE.NearestFilter
  texture.minFilter = THREE.NearestMipmapLinearFilter
  texture.anisotropy = 1
  return texture
}

function firstSkinnedMesh(root) {
  let found = null
  root.traverse((o) => {
    if (!found && o.isSkinnedMesh) found = o
  })
  return found
}

function firstMesh(root) {
  let found = null
  root.traverse((o) => {
    if (!found && (o.isMesh || o.isSkinnedMesh)) found = o
  })
  return found
}

async function applySkin(built, id) {
  if (!isEquipped(id)) return
  let texture
  try {
    texture = configureSkinTexture(await textureLoader.loadAsync(skinUrl(id)))
  } catch {
    return // keep the rig's embedded texture
  }
  built.owned.textures.push(texture)
  for (const mesh of built.baseMeshes) {
    mesh.material.map = texture
    mesh.material.needsUpdate = true
  }
}

async function applyPart(built, slot, id) {
  let gltf
  try {
    gltf = await gltfLoader.loadAsync(partUrl(slot, id))
  } catch {
    return // slot unavailable: the default_* mesh stays visible
  }
  const mesh = firstMesh(gltf.scene)
  if (!mesh) return

  convertMaterials(gltf.scene, built.owned)
  built.owned.scenes.push(gltf.scene)

  const replaced = built.nodes[slot.replaces]
  if (replaced) replaced.visible = false

  if (mesh.isSkinnedMesh && built.skinned) {
    mesh.bind(built.skinned.skeleton, built.skinned.bindMatrix)
    built.root.add(mesh)
  } else {
    const bone = built.nodes[slot.bone]
    if (bone) bone.add(mesh)
    else built.root.add(mesh)
  }
  built.slotObjects.push(mesh)
}

async function applyItem(built, slot, id) {
  const urls = itemUrls(slot, id)
  let object
  try {
    object = await objLoader.loadAsync(urls.mesh)
  } catch {
    return
  }
  let texture = null
  try {
    texture = configureItemTexture(await textureLoader.loadAsync(urls.texture))
    built.owned.textures.push(texture)
  } catch {
    // An untextured item still beats no item.
  }
  convertMaterials(object, built.owned)
  if (texture) {
    object.traverse((o) => {
      if (o.isMesh) {
        o.material.map = texture
        o.material.needsUpdate = true
      }
    })
  }
  built.owned.scenes.push(object)
  const anchor = built.nodes[slot.attach]
  if (anchor) anchor.add(object)
  else built.root.add(object)
  built.slotObjects.push(object)
}

// Returns null only when `token` was cancelled mid-retry.
export async function buildAvatar(equipped, token) {
  const gltf = await loadBaseRig(token)
  if (!gltf) return null

  const root = gltf.scene
  const owned = { materials: [], textures: [], scenes: [root], converted: new Map() }
  const nodes = {}
  root.traverse((o) => {
    if (o.name) nodes[o.name] = o
  })

  const baseMeshes = []
  root.traverse((o) => {
    if (o.isMesh || o.isSkinnedMesh) baseMeshes.push(o)
  })

  convertMaterials(root, owned)

  const built = {
    root,
    nodes,
    owned,
    baseMeshes,
    slotObjects: [],
    skinned: firstSkinnedMesh(root),
    clips: gltf.animations || [],
  }

  const slots = equipped || {}
  await applySkin(built, slots.skinId)

  // Slots load in parallel; each one swallows its own failure.
  await Promise.all(
    AVATAR_SLOTS.map((slot) => {
      const id = slots[slot.key]
      if (!isEquipped(id)) return null
      return slot.kind === 'part' ? applyPart(built, slot, id) : applyItem(built, slot, id)
    }).filter(Boolean),
  )

  return built
}

// Drives the rig from the (already clamped) proportions and returns the
// collider dimensions the movement system should adopt.
export function applyProportions(built, p) {
  const n = built.nodes

  if (n.ArmL_Offset) n.ArmL_Offset.position.x = RIG.armOffsetX * p.shoulderWidth
  if (n.ArmR_Offset) n.ArmR_Offset.position.x = -RIG.armOffsetX * p.shoulderWidth
  if (n.ArmL1) n.ArmL1.scale.y = p.armLength
  if (n.ArmR1) n.ArmR1.scale.y = p.armLength
  if (n.LegL_Offset) n.LegL_Offset.position.x = RIG.legOffsetX * p.legOffsetX
  if (n.LegR_Offset) n.LegR_Offset.position.x = -RIG.legOffsetX * p.legOffsetX
  if (n.Spine1) n.Spine1.scale.x = p.torsoScaleX
  if (n.Neck_Offset) n.Neck_Offset.position.y = RIG.neckOffsetY * p.neckHeight
  if (n.Neck1) n.Neck1.scale.setScalar(p.headScale)

  built.root.scale.setScalar((PLAYER_HEIGHT / RIG_HEIGHT) * p.height)

  return {
    height: PLAYER_HEIGHT * p.height,
    radius: PLAYER_RADIUS * p.shoulderWidth,
  }
}

// three.js does not GC GPU memory.
export function disposeAvatar(built) {
  if (!built) return
  for (const scene of built.owned.scenes) {
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose()
      const mats = Array.isArray(o.material) ? o.material : [o.material]
      for (const m of mats) {
        if (!m) continue
        if (m.map) m.map.dispose()
        if (m.normalMap) m.normalMap.dispose()
        if (m.roughnessMap) m.roughnessMap.dispose()
        if (m.metalnessMap) m.metalnessMap.dispose()
      }
    })
    if (scene.parent) scene.parent.remove(scene)
  }
  for (const material of built.owned.materials) material.dispose()
  for (const texture of built.owned.textures) texture.dispose()
  built.owned.scenes.length = 0
  built.owned.materials.length = 0
  built.owned.textures.length = 0
  built.owned.converted.clear()
}
