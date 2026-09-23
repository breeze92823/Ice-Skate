# Guard-Wall Containers — build instructions

A "container" is the sealed guard-wall + roof tunnel that runs between two
consecutive `StageWall.NNN` transition panels (`data/stageWalls.js`). This
file is the playbook for building the next one (e.g. "do the same from
StageWall.008 to StageWall.009") — follow it in order rather than
re-deriving the approach from scratch. It was extracted from how
`data/sideWalls.js` (Stage1→2) through `data/stage8Walls.js` (8→9, the
first 90° turn) were actually built, including the mistakes that got
corrected along the way — read the **Gotchas** section before starting,
not after.

## What a container is

Two side walls + a roof, forming a corridor the player skates/jumps
through between one stage's transition doorway and the next. No bottom cap
— the walls just extend down to `WATER_Y` (0). The only two openings are
the two `StageWall` doorways at each end; everything else must be sealed
(see "Connect at the panels" below).

Each container is a `data/stageNWalls.js` + `components/StageNWalls.jsx`
pair, wired into `src/App.jsx` (render) and
`src/systems/playerMovement.js` (collision — `SIDE_WALL_COLLIDERS`).

## Step 0 — survey before building anything

1. Read `StageWall.N` and `StageWall.N+1`'s `position`/`rotationY`/size in
   `data/stageWalls.js` to get the container's exact range. If neither
   panel carries `rotationY`, this is a straight run: `StageWall.N`'s far
   face (`z + STAGE_WALL_HALF_DEPTH`) through `StageWall.N+1`'s near face
   (`z - STAGE_WALL_HALF_DEPTH`). **If `StageWall.N+1` carries a
   `rotationY` (check every container from here on — `StageWall.009`
   through at least `.012` do, per `data/groundBlocks.js`'s turn-pillar
   comment), the corridor turns 90° inside this container** — see the
   **Turns** section below before doing anything else; Steps 1-4 below
   describe a straight run.
2. Use the Blender MCP tools (`get_objects_summary`, then
   `get_object_detail_summary` on anything unusual) to check what's
   actually in that z-range — **don't assume it's a flat corridor**. Check
   for:
   - Which `GroundBlock.NNN` collection(s) the floor belongs to, and get
     each block's real position/size from `data/groundBlocks.js` (already
     synced — don't re-derive from Blender if it's already there).
   - Non-rectangular or tilted terrain (`Slope_Block`-style ramps —
     `rotationX`/`bands` entries in `data/groundBlocks.js`).
   - Disconnected/staggered platform clusters (a jump section, not a lane
     — multiple `Ground.NNN` at different x-offsets with gaps, not one
     contiguous slab).
   - Any `WinPad.NNN` (glow floor panel, `data/glowFloorPanel.js`) sitting
     in this z-range — these need clearance (see below).
   - Anything else stage-specific that might need extra room (a hazard
     object like `Giant_Ball` that the walls need to physically contain).
3. If the terrain isn't a simple constant-or-alternating-width flat
   corridor (a tilted ramp, a jump/platform cluster, anything without one
   obvious "lane" to hug), **stop and ask the user** how they want it
   handled before writing geometry. Don't guess at a simplification for
   irregular terrain — past examples: asking whether to tilt a wall to
   match a ramp's rise or keep it flat, and whether to wall in individual
   jump platforms or build one outer perimeter room around the whole
   cluster. Present the concrete numbers (footprint bounds, height
   differences) so the question is answerable, not abstract.

## Step 1 — pick lane widths

- **Reuse constants across files.** `NORMAL_LEFT`/`NORMAL_RIGHT`
  (`-10.071032524108887` / `10.043127059936523`) is the baseline lane used
  everywhere. If a floor block shares a width already seen in another
  container (33.651187896728516 shows up in `Ground.010`, `.013`, `.015`,
  `.024` — all "WIDE"), reuse that exact WIDE half-width value
  (`15.325593948364258`) rather than recomputing it.
- **Floor-hugging fit** (walls should stand on a specific slab, not float
  past its edge): `half_width_of_slab - 0.5 (margin) - 1 (wall half-thickness)`.
  Use this for any block whose width doesn't already have a named constant.
- **"Give room" perimeter** (an outer room around a jump/platform cluster,
  not hugging one slab's edge): compute the cluster's combined bounding
  box (rotated platforms too — rotate each block's 4 corners by its own
  `rotationY` and take the min/max, don't just use its unrotated
  width/depth), then add a **3m** clearance margin (not the tight 0.5m).
  Size it symmetrically (both sides sized to whichever extent is larger),
  not an asymmetric tight fit, even when the cluster itself is lopsided —
  simpler, and the established default after three scattered-platform
  containers in a row confirmed it (Stage4's jump section, Stage6's side
  platforms, Stage7's rotated pillar cluster): by the third case this
  stopped needing a fresh confirmation each time and became the default
  for "scattered/rotated cluster, no single lane to hug" — see Step 0's
  Blender rotationY note.
- **WinPad clearance**: if a `GLOW_FLOOR_PANEL_POSITIONS` entry falls in
  this z-range, check the distance from its x to the lane's inner wall
  face. If that distance is already ≥ `GLOW_FLOOR_PANEL_RANGE` (3.5), the
  lane clears it for free (this is why the WIDE lane's ~14.3 inner face
  clears WinPad.004/.005 without extra work — check the actual numbers
  before assuming). If not, build a bulge (see `data/sideWalls.js`'s
  `SIDE_WALL_BULGES`/`SIDE_WALL_JOGS` for the reference implementation):
  the alcove's inner face should clear the panel by exactly `RANGE`, and
  the bend should return to normal width well clear of the panel in z too
  (`sqrt(RANGE² - x_gap²)` is the minimum z-clearance at the transition
  jog; use a bigger margin than the bare minimum if there's room).

## Step 2 — lay out segments and jogs

- Each straight run is a flat, axis-aligned box:
  `{ name, position: [x, WALL_Y, zCenter], size: [2, WALL_HEIGHT, depth] }`,
  one per side (`.right`/`.left`).
- Between two different-width runs, add an **elbow jog**: a box whose long
  axis runs along X instead of Z (`position: [midpointX, WALL_Y, zCenter]`,
  `size: [widthSpan, WALL_HEIGHT, JOG_DEPTH]`), bridging the two lane
  lines. `JOG_DEPTH = 0.8684097290039062` throughout this project. Every
  jog should sit exactly at the floor seam (or wherever the width needs to
  change) with its center there, so it overlaps ~0.3m into each
  neighboring straight run automatically (`JOG_DEPTH / 2` on each side).
- Keep everything **flat/unrotated** unless there's a hard reason not to
  (see the ramp gotcha below) — `resolveSideWalls` in
  `playerMovement.js` only does unrotated-AABB collision.
- **Connect at the panels.** Right at each `StageWall`'s face, the lane
  must be at (or immediately transitioning through a jog to) the NORMAL
  lane — matching the panel's own ~18.47m width — not left at some other
  width. Two sub-cases:
  - If there's room (the floor doesn't force a different width
    immediately), add a short flat NORMAL-lane connector (2m is the
    convention used so far) right at the panel face, then jog to whatever
    width comes next.
  - If the floor's own edge is right at the panel (no room for a flat
    connector — e.g. a ramp starting almost immediately), the first jog
    can start right at the panel's face directly.
  - This exists because a container that immediately narrows/widens right
    at the doorway leaves a chunk of the panel's own glass outside the
    collidable boundary, or a visible mismatch between the door's width
    and the guard walls flanking it — both were found and fixed as
    separate issues; build it right the first time instead.

## Turns (when `StageWall.N+1` is rotated)

First confirmed in `data/stage8Walls.js` (Stage8→9). When the next
`StageWall` carries `rotationY` (so far always -90°, i.e.
`-1.5707963705062866`, matching the `GroundBlock.NNN` turn-pillar
convention), the corridor bends 90° partway through the container instead
of running straight. Two approaches exist — **ask the user which one they
want** (this is a big enough divergence in effort/shape that it's worth a
fresh confirmation, unlike the by-now-default perimeter room):

- **One big room over the whole bend** — treat the turn's combined floor
  footprint as one rectangular perimeter room (Step 1's perimeter
  technique), same as a scattered-platform cluster. Simple, but boxy —
  the room is as big as the bend's full bounding rectangle even though the
  corridor itself is much narrower.
- **The actual L-shape** — hugs the floor properly. Built from **4 wall
  pieces forming two overlapping L's, not a rotated box**:
  - Figure out which side of the original straight run is the **outer**
    side of the turn (the one that has to sweep the long way around the
    bend) and which is the **inner** side (the one that cuts the corner
    short) — depends on which way the corridor turns. If heading +Z and
    bending toward -X, the +X wall is outer, the -X wall is inner (a left
    turn always makes the original right-hand wall the outer one).
  - **OUTER**: a Z-oriented wall piece (`size: [2, WALL_HEIGHT, zSpan]`,
    same shape as any other straight-run wall) running from the
    container's start up to the new corridor's *far* cross-street edge,
    PLUS an X-oriented piece (`size: [xSpan, WALL_HEIGHT, 2]` — same shape
    as a jog, just much longer) running from the far end back past the
    original wall's own x-line. Each one extends **1m past where the
    other one's centerline sits** (not just "up to" it) — this is Gotcha
    #2 again: two boxes whose ranges merely touch on one axis don't
    necessarily share any 3D volume; extending past the centerline
    guarantees genuine overlap.
  - **INNER**: the mirror of OUTER, except its Z-oriented piece stops at
    the *near* cross-street edge instead of the far one — the concave
    notch behind the inner corner doesn't need wall coverage, since
    nothing is ever on that side of it.
  - Both legs (the original straight-run lane and the new perpendicular
    lane) can each pick their own width using Step 1's normal rules — they
    don't have to match each other. No jog is needed at the bend itself;
    the OUTER/INNER pieces' differing extents already encode the turn.
  - **Roof**: two flat pieces, one over each leg, each similarly extended
    1m past the other's own edge at the corner so they overlap solidly
    instead of just sharing a range on one axis.
  - No new collision math: every piece here is still a plain flat
    unrotated box, so `resolveSideWalls`'s existing AABB push handles the
    whole turn for free.

### When the traversal mechanic doesn't exist yet

First hit in `data/stage10Walls.js` (Stage10→11): the two boundary panels
can be dozens of metres apart in **height**, not just position, with no
staircase/ramp/lift modeled in the floor yet to explain how the player is
meant to get from one to the other — a plain, unrotated, absurdly tall
`Ground.NNN` block sitting where a ramp "should" be is the tell (contrast
with `Slope_Block`, a genuinely custom ramp mesh, or a `rotationX` tilt).
**Stop and ask the user** what the mechanic is or will be; don't guess at
modeling a climb that isn't there. If they say it's coming later ("just
keep space till top"):

- Set `ROOM_TOP` to the taller boundary panel's own top, same as the
  normal Step 4 rule — nothing special there.
- Don't try to hug the placeholder floor blocks' own (often oddly narrow)
  footprints — they're not the finished lane. Run one constant width the
  whole container (Step 2's normal-lane magnitude is a safe default),
  connected flush at both panels, no jogs.
- Make every piece in the container that tall — water to `ROOM_TOP` —
  for the container's *entire* length, not just near wherever the
  vertical jump happens to be. The point is that nothing here should need
  touching again once the real climb geometry exists later; a premature
  roof anywhere in the run would.
- The shorter boundary panel gets a `STAGE N_DOOR_FILLS` entry as usual
  (Step 4) — a ~90m height difference makes that gap larger than usual,
  but the fill itself is built exactly the same way.

## Step 3 — roof

- One flat roof box per straight run, positioned at
  `[roofX, ROOF_Y, zCenter]`, `size: [width, ROOF_HEIGHT, depth]`.
  `ROOF_HEIGHT = 1.5`, `ROOF_Y = WALL_Y + WALL_HEIGHT / 2 + ROOF_HEIGHT / 2`
  (flush on top of the walls, no gap).
- **Roof width must match the wall footprint below it exactly** — a
  NARROW-width roof over a WIDE section, or vice versa, either leaves a
  gap or floats past the walls. Reuse the `_ROOF_WIDTH`/`_ROOF_X` naming
  convention (`NORMAL_ROOF_WIDTH`/`_X`, `WIDE_ROOF_WIDTH`/`_X`, etc. — the
  roof spans each lane's two walls' *outer* faces, i.e. `laneHalfWidth + 1`
  on each side).
- **Merge a jog's roof coverage into whichever neighboring lane it's
  widest toward**, rather than giving every jog its own tiny roof piece —
  check which side's `_ROOF_WIDTH` the jog's own outer extent matches, and
  extend that piece's z-range to swallow the jog. This is what cuts a
  naive 8-roof-piece layout down to 3-4 pieces per container in practice.

## Step 4 — height (WALL_Y / WALL_HEIGHT)

No bottom cap: `WATER_Y = 0` is always the floor of `WALL_HEIGHT`. The
ceiling (`ROOM_TOP`) depends on what's actually in the container:

- **A hard physical constraint exists** (e.g. `Giant_Ball` — something the
  walls must physically contain so it can't escape sideways): `ROOM_TOP`
  = that object's own top edge (`position.y + radius`, or equivalent),
  not just its center — clear the whole object, not a point.
- **No hard constraint**: default `ROOM_TOP` to the *taller* of the two
  boundary `StageWall` panels' own tops (`position.y + PANEL_HEIGHT / 2`,
  `PANEL_HEIGHT = 11.44459056854248` for all of them so far). This keeps
  the container from being needlessly tall.
- Every wall/jog/roof height in the file should derive from `WALL_Y`/
  `WALL_HEIGHT`/`ROOF_Y` constants — never hardcode a second height value
  in the same file.

### Door-top infill (`STAGE N_DOOR_FILLS`)

If `ROOM_TOP` ends up taller than a boundary panel's own top (either
because of a hard constraint, or because the *other* boundary panel is
taller), that panel needs a solid infill panel above it, closing the gap
up to the ceiling:

- **Width/x**: `NORMAL_ROOF_WIDTH`/`NORMAL_ROOF_X` (the walls' own
  outer-face span at that point) — **not** the door panel's own width.
  The door's width alone leaves the fill too narrow to actually reach the
  walls (see Gotcha #2).
- **Depth**: the panel's own thickness (`0.22710511088371277`) **plus a
  0.3m OVERLAP into each neighboring wall/jog** — same overlap convention
  as every other seam in this project. Sizing it to just the door's own
  thickness leaves it floating in the same x-range as the walls without
  actually touching them in z (see Gotcha #2 — this was found and fixed
  after the first attempt).
- **Height/y**: from that panel's own top to `ROOM_TOP`, centered between
  them.
- No fill is needed at whichever boundary panel *is* the taller one that
  set `ROOM_TOP` — its own top already is the ceiling there.

## Step 5 — wire it up

1. `src/App.jsx`: import and render `<StageNWalls />` next to the other
   containers (order doesn't matter functionally, but keep it in stage
   order for readability).
2. `src/systems/playerMovement.js`: import every *solid* export (segments,
   jogs, door fills — not purely decorative pieces if any exist) and
   spread them into the module-level `SIDE_WALL_COLLIDERS` array. Never
   rebuild this array per-frame — it's built once at module scope.
3. Component file: use the **size-keyed material cache** pattern (see
   `components/Stage3Walls.jsx`/`Stage4Walls.jsx`), not the older
   one-`useFaceMaterial()`-hook-per-shape-category pattern from
   `components/SideWalls.jsx`. A container with more than half a dozen
   distinct box sizes can't give each one its own fixed hook call (hooks
   can't run inside `.map()`), so build all materials in one `useMemo`
   keyed by `size.join('x')`, with one `useEffect` disposing everything on
   unmount.
4. **Rebuild and check**: `npx vite build --mode development`, then
   `rm -rf dist` (this is a syntax/type check, not a deploy — don't leave
   the build output around). If you can, also spot-check visually: run
   the dev server, temporarily edit `data/hub.js`'s `SPAWN` to a z inside
   the new container (revert it afterward, always in a `try`/`finally`),
   and screenshot a few seam points from inside — see Gotcha #4.

## Naming conventions

- File names: `data/stageNWalls.js`, `components/StageNWalls.jsx` (N =
  the *lower* of the two stage numbers this container connects).
- Straight runs: `StageNWall.<label>.right` / `.left` (e.g. `g014`,
  `ramp`, `perimeter`, `final`).
- Jogs: `StageNJog.<letter>.right` / `.left`, lettered in z-order (A, B,
  C... continuing from where the previous container's jogs left off is
  fine, doesn't need to reset per file).
- Roofs: `StageNRoof.<label>` (no `.right`/`.left` — one box spans both
  walls).
- Door fills: `StageNDoorFill.<NNN>` (NNN = the StageWall number the fill
  sits above).

## Gotchas (read before, not after)

1. **Tilted/rotated geometry: verify against Blender's actual world-space
   bounding box, don't hand-derive it.** When `data/stage3Walls.js`'s ramp
   wall needed to follow `Slope_Block`'s rise, a manual rotation-matrix
   derivation from the object's `bands`/`rotationX` local-frame data gave
   visibly wrong numbers (a ~16-unit span instead of ~89). The fix was
   Blender MCP `execute_blender_code` doing
   `mw = obj.matrix_world; [mw @ v.co for v in obj.data.vertices]`, taking
   the raw min/max, then applying this project's *already-established*
   `three.(x,y,z) = (blender.x, blender.z, -blender.y)` conversion — don't
   trust a from-scratch re-derivation of an object's local coordinate
   convention when the ground truth is one MCP call away.
2. **An infill/fill piece must overlap the *right axis*, not just share an
   x-range.** `STAGE3_DOOR_FILLS`' first version matched the door's width
   reasonably closely and looked "roughly overlapping" by X alone — but it
   was sized to the door's own thin z-depth, and the neighboring guard
   walls don't extend into that thin z-slice at all (one wall ends at the
   panel's near face, the next starts at its far face). Two shapes whose
   X-ranges overlap don't touch in 3D if their Z-ranges don't also
   overlap. Always check the actual 3D intersection, not just one axis.
3. **Reconsider old complexity when a requirement changes the scale.**
   The ramp wall started tilted (to hug the ramp's ~18m rise closely at
   the original ~16.75m wall height). Once the container's height grew to
   ~47.5m for `Giant_Ball` clearance, that 47.5m span already dwarfed the
   ramp's own rise everywhere along its length — hugging the surface
   stopped mattering visually, so the tilt was dropped entirely: same
   coverage, simpler geometry, and the wall picked up real AABB collision
   it didn't have while rotated. Don't leave a rotated/special-cased
   piece in place out of inertia once the reason for it is gone.
4. **A "fell into water" test result isn't automatically a floor-collision
   bug.** Spawning the test player far above the actual floor (e.g. y=25
   when the real floor is at y≈18) to inspect a container visually can
   itself cause a fall-through that never happens in normal play (grounded
   from a realistic height, spawned close to the actual floor level,
   worked fine). If a spawn-based visual check shows something wrong,
   re-test from a realistic height before concluding there's a real bug.
5. **`StageWall.002` doesn't need a door fill** — Stage1/2's container
   height (~16.75m) already lands almost exactly on that panel's own top,
   apparently by original design. Don't assume every boundary needs a fill
   — only add one where the actual numbers (`ROOM_TOP` vs. that panel's
   own top) show a real gap.
6. **"Wider than the panel everywhere" is not the same as "connect at the
   panel."** `data/stage8Walls.js`'s X-run first left `X_RUN_HALF` (a wide
   lane) flush against StageWall.009 with no narrowing, reasoning that
   since it was wider than the panel's own span the "maintain space" rule
   (Step 2) was satisfied — it technically was, but the result was a
   visibly blank stretch of open, wall-less room flanking the much
   narrower glass door right at the threshold. Step 2's connect-at-the-
   panel rule means the opening should *converge toward* the panel's own
   width approaching it, not just stay wider than it the whole way — apply
   the short-connector-then-jog treatment at every panel unless the user
   explicitly asks to keep a wide lane all the way through (as they did for
   `data/stage5Walls.js`/`data/stage6Walls.js`), not by default. This
   applies however the lane is oriented — the fix here was the same jog
   pattern as any other width transition, just rotated 90° along with the
   rest of the turn.
