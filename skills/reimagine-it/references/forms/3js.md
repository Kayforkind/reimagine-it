# /reimagine-it 3js

Load when the user forces `3js`, or the router picks a Three.js scene. Gold: [`gold/forms/3js/after.html`](../../../gold/forms/3js/after.html).

This is a **room you can orbit**, not a 30 KB primitive dump (default cube, four cones, HUD over the subject).

## Layout law (fail if broken)

1. **HUD never covers the subject.** Title, kickers, and look-at buttons live in a **reserved strip** (header or footer with its own height). The canvas is a sibling, not a wallpaper under type. No `position: absolute` copy on top of meshes.
2. **The field fills the frame.** Camera is close enough that silhouettes read in a 1400×900 still. A bird’s-eye of three toys on a brown disk is a fail.
3. **Silhouettes from the source.** Alamo → chapel facade (stepped gable, dark arch). Capitol → wings + shaft + dome. Big Bend → displaced ground + river tube, not four `ConeGeometry`s. One five-point star as a monument, not a sticker on the floor.
4. **Light is a sunset, not a default.** Hemisphere + directional sun with **soft shadows** (`PCFSoftShadowMap`, map 2048). `outputColorSpace = SRGBColorSpace`. `ACESFilmicToneMapping`. Fog or a sky dome so the horizon is not a void.
5. **Offline.** Pin Three.js in-repo (r185 split: `three.module.min.js` + `three.core.min.js`). No CDN. No `npm create vite` unless the workspace is already that app. Do not import `OrbitControls` from examples — r185 min build does not export `Controls`; write pointer orbit or vendor a matching addon that does not need it.

## Quality bar (the “more than 30 KB” test)

A shipped 3js file is `partial` if **any** of these are true:

- The only meshes are `BoxGeometry` / `SphereGeometry` / `ConeGeometry` with no boolean of them into a recognizable place
- First-frame screenshot is mostly empty ground
- Type overlaps the 3D
- Unlit `MeshBasicMaterial` for the hero meshes (lights exist; use `MeshStandardMaterial`)
- Random palette (hot pink, CSS default) instead of source color

## Interaction

- Drag orbit, wheel dolly, HUD look-ats to each named place
- `prefers-reduced-motion: reduce` pins the camera and stops idle spin
- `:focus-visible` on HUD controls; `::selection` if any HTML text remains
- `document.documentElement.dataset.ready = "1"` after the first rendered frame

## Must not

- CDN `three`
- Dribbble lighting on unrelated geometry
- Invented KPIs floating as CSS counters over the canvas
- A second overlay manifesto (`Drag to orbit…` as a paragraph on the scene) — put hints in the reserved strip or `title`

## Proof

File opens on `http` or `file` with the vendored import map. First frame not blank. Screenshot: silhouettes identifiable, no overlapping HUD. Report `partial` if it still looks like a tutorial cube.
