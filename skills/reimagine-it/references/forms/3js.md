# /reimagine-it 3js

Load when the user forces `3js`, or the router picks a Three.js scene. Gold: [`gold/forms/3js/after.html`](../../../gold/forms/3js/after.html) — **one draw of one Texas notebook**, not a skin.

This is a **room that lives**, not a 30 KB primitive dump (default cube, four cones, HUD over the subject). Pick this form when the source should be **orbitable and quietly alive** — micro-motion on the meshes themselves.

## This source, this run — not a template

Fail the run if a client could mistake the room for the Texas gold when the source is not that notebook.

| Layer | From this source | Never from |
|-------|------------------|------------|
| **Meshes** | Named places / tools / rooms in *this* file, booleaned into a silhouette a still can name | Alamo chapel, capitol dome, Big Bend ridge, plinth star |
| **Light** | This source's time of day, habitat, material | West-Texas sunset ACES on a night-dive or a print shop |
| **Palette** | Named colors, materials, inks in the text | Navy / cream / star-red / gold unless *this* source names those |
| **Idle lives** | 2–4 loops on *this* file's anchors | Star-turn + Rio Grande motes + chapel-window pulse |
| **HUD look-ats** | Objects in *this* room (a cone, a scoop, a freezer, a press) | "Alamo, 1836" / "Austin, 1839" / "Big Bend, 1944" / a generic **All three** of buildings on a disk |

A second run on the **same** source is still a new draw (camera, which mesh is the weenie, ground) unless `--seed` / `--variant` pinned it.

## Open brief (leftover words)

Unknown words after known tokens are a **creative lens**. Follow them. Reweight ground, light, which mesh idles, camera distance. Do not invent places. Leftover `still` / `no-motion` / `print` pins the camera and freezes idle life. Drag + HUD look-ats stay (controls, not decoration).

```
/reimagine-it 3js
/reimagine-it 3js <any words the user typed>
```

## Why this form exists

| They want | Form |
|-----------|------|
| A statistical poster (still argument) | `infographic` |
| A mark that lives in a README / slide | `svg` |
| A field they can walk with the pointer | **`3js`** |
| Time actually passing | `simulation` |

Default is **alive**.

## Layout law (fail if broken)

1. **HUD never covers the subject.** Title, kickers, and look-at buttons live in a **reserved strip** (header or footer with its own height). The canvas is a sibling, not a wallpaper under type. No `position: absolute` copy on top of meshes.
2. **The field fills the frame.** Camera is close enough that silhouettes read in a 1400×900 still. A bird’s-eye of three toys on a brown disk is a fail. A shop is shot from the counter, not from a drone over three buildings.
3. **Silhouettes from this source.** Boolean primitives into a place a still can name. Not four `ConeGeometry`s standing in for whatever the last gold used.
4. **Light matches this source.** Hemisphere + directional key with **soft shadows** (`PCFSoftShadowMap`, map 2048). `outputColorSpace = SRGBColorSpace`. `ACESFilmicToneMapping`. Fog or a sky so the horizon is not a void. A sunset only if the source has a sunset.
5. **Offline.** Pin Three.js in-repo (r185 split: `three.module.min.js` + `three.core.min.js`). No CDN. No `npm create vite` unless the workspace is already that app. Do not import `OrbitControls` from examples — r185 min build does not export `Controls`; write pointer orbit or vendor a matching addon that does not need it.

## Quality bar (the “more than 30 KB” test)

A shipped 3js file is `partial` if **any** of these are true:

- The only meshes are `BoxGeometry` / `SphereGeometry` / `ConeGeometry` with no boolean of them into a recognizable place from *this* source
- First-frame screenshot is mostly empty ground
- Type overlaps the 3D
- Unlit `MeshBasicMaterial` for the hero meshes (lights exist; use `MeshStandardMaterial`)
- Random palette (hot pink, CSS default) instead of source color
- The room is the Texas gold with the title swapped

## Alive-micro (default motion budget)

Ship **2–4 idle lives** on the *meshes*, plus camera ease. Each life maps to an **anchor**. Do not spin the whole scene or bounce the camera.

Pick from this menu:

| Life | How | Maps to |
|------|-----|---------|
| **weenie-turn** | Slow `rotation.y` on the monument / hero mesh | the magnet |
| **flow** | Points or tiny spheres advancing along a `Curve` that *is* the river / wire / handshake | a verb |
| **sun-breath** | Emissive intensity on one window, lamp, or cap (clone the material — do not pulse a shared material used by the weenie) | light already in the source |
| **wide-drift** | Very slow `spherical.theta` **only** while look-at is the wide shot and the pointer is up | the room |

Camera `lerp` to HUD look-ats is interaction, not one of the four lives.

**Hover.** Pointer over a named mesh may raise that mesh’s emissive a step and `aria-pressed` the matching HUD button. Do not paint a CSS label on the canvas.

**Reduced motion.** `prefers-reduced-motion: reduce` pins the camera to `dest`, stops idle spin / motes / emissive pulse / wide-drift. Look-ats still jump (instant). `:focus-visible` on HUD controls stays.

## Interaction

- Drag orbit, wheel dolly, HUD look-ats to the objects in *this* room
- Wide-drift resumes only on the wide shot of **this** room, never while dragging. Do not label that button `All three` unless the source is three monuments.
- `document.documentElement.dataset.ready = "1"` after the first rendered frame (first frame is the rest pose)

## Must not

- CDN `three`
- Dribbble lighting on unrelated geometry
- Invented KPIs floating as CSS counters over the canvas
- A second overlay manifesto on the scene — put hints in the reserved strip or `title`
- Auto-spin the camera on a tight look-at
- Pulse a material shared by every hero mesh
- Particle rain unrelated to a source verb
- **Clone the Texas gold** (chapel + capitol + ridge + plinth star + west-Texas sunset, or that gold’s `All three` HUD over three toys on a disk) onto a source that is not that notebook

## Gold (example only)

That notebook names Alamo, Austin, Big Bend, a river, a star, and a sunset. The gold therefore: chapel facade, capitol wings + dome, displaced ridge + river tube, star on a plinth, sunset ACES, those four idle lives. **Copy the method, not the scenery.**

## Proof

File opens on `http` or `file` with the vendored import map. First frame not blank. Screenshot: silhouettes identifiable as *this* source, no overlapping HUD. Two frames ~600 ms apart differ unless the brief was `still`. Report `partial` if it still looks like a tutorial cube, if the pack claims alive and the hashes match, or if the room is the Texas gold wearing a new title.
