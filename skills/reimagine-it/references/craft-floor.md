# Craft Floor — the interaction contract every reimagined webpage must clear

Distilled from Rauno Freiberg's `interfaces` (Vercel), Emil Kowalski's design-engineering SKILL (Linear), WCAG 2.2 SC 2.3.3 + 1.4.11 + 2.4.7, the 2025 Awwwards SOTY nominee stack analysis, and the shipping practice at Instrument / Active Theory / Locomotive.

Full research pack: [research/web-craft-2025.md](research/web-craft-2025.md).

**If a produced webpage cannot clear every rule below on the first scan, downgrade the report from `shipped` to `partial` and name the specific miss.** No exceptions.

---

## 1. Interaction non-negotiables

The details users never consciously notice. That is the point.

- [ ] Clicking `<label>` focuses the input (use `<label for="id">`).
- [ ] Every input is inside a `<form>` so Enter submits.
- [ ] Inputs have the right `type` (`email`, `password`, `search`, `tel`, `number`, `url`).
- [ ] `spellcheck="false"` and `autocomplete="off"` where inappropriate (usernames, codes, custom fields).
- [ ] `required` on fields that must be filled — free HTML validation before any JS.
- [ ] Input prefix / suffix icons are **absolutely positioned inside** the input; the whole surface focuses.
- [ ] Toggles take effect immediately — no confirm step.
- [ ] Buttons disable **after** submit to block duplicate requests.
- [ ] `user-select: none` inside interactive elements (buttons, tiles, drags).
- [ ] Decorative elements (glows, gradients, blur plates) have `pointer-events: none`.
- [ ] Vertical / horizontal item lists have **no dead zones** — extend padding instead.
- [ ] `::selection` is styled with the brand accent (do not leave the browser default blue).
- [ ] Gradient text unsets the gradient inside `::selection` (otherwise the highlight goes invisible).
- [ ] Inline copy checkmark on a successful copy, not a toast (feedback lives at the trigger).
- [ ] Highlight the offending input on form error, not a top-of-page banner.
- [ ] Optimistic UI updates locally; rollback with feedback on server error.
- [ ] Nested menus use a **prediction cone** to keep the pointer path forgiving.
- [ ] Empty states prompt to create with an optional template — not a blank void.

## 2. Focus & keyboard

- [ ] Every interactive element has a visible `:focus-visible` state — never `:focus` alone (that paints on mouse click too, and gets noisy).
- [ ] Focus ring meets WCAG 2.2 SC 1.4.11: **3:1 contrast** against adjacent color, **≥ 2 px** perimeter equivalent.
- [ ] `outline` (not `border`, not `box-shadow` alone) so it survives all backgrounds; add `outline-offset` for breathing room.
- [ ] Sticky headers set `scroll-padding-top` (or `scroll-margin-top` on targets) so focused elements are not hidden.
- [ ] Tab order follows visual order. No positive `tabindex`. No `outline: none` without a real replacement.
- [ ] Never remove the focus indicator (WCAG 2.4.7 — non-negotiable).

## 3. Motion timing (Emil / Social Animal / Masters-in-Clarity)

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Hover state | 100–150 ms | `ease-out` |
| Button press | 100 ms | `ease-out` |
| Toggle / checkbox | 150–200 ms | `ease-in-out` |
| Modal open | 200–250 ms | `ease-out` |
| Modal close | 150–200 ms | `ease-in` |
| Element fade-in | 200–300 ms | `ease-out` |
| Toast | 300 ms in, 200 ms out | `ease-out` / `ease-in` |
| Page reveal | 300–500 ms with staggered chunks | `ease-out` |

Rules:
- **`ease-out` is the workhorse.** Never `linear` (feels mechanical).
- **Exits are faster than entrances** — 150 ms out for a 200 ms in.
- **Spring physics** for anything that should feel weighty (drawers, cards, hero moves). Prefer `stiffness/damping/mass` over `duration` when a library allows it.
- **`transition: transform 150ms ease-out`** — explicit properties, never `transition: all` (thrashing).

## 4. Compositor-only motion (or fail visual verify)

Anything animated during scroll or interaction must use **only** these properties:

- `transform` (`translate`, `scale`, `rotate`)
- `opacity`
- `filter` (blur, brightness — use sparingly, it is expensive)

Failing choices that force layout recalc every frame — **do not use for motion**:

`top`, `left`, `right`, `bottom`, `margin`, `padding`, `width`, `height`, `font-size`, `letter-spacing`, `line-height`, `word-spacing`, `color`, `background-color` (except on hover of a static element).

Swap to:
- Move: `transform: translate(x, y)`.
- Grow: `transform: scale(k)` — reserve inline space with `min-width` if needed.
- Color transition: layer a pseudo-element on top and animate its `opacity`.
- Reveal: `overflow: hidden` parent + `translateY` child.
- Type morph: variable-font `font-variation-settings` interpolation (with letter-spacing buffer, see §6).

## 5. Reduced motion (decompose, do not suppress)

Focus indicators and state feedback are essential. **Their entering animation is not.** Under `prefers-reduced-motion: reduce`, keep functional feedback, drop decorative transitions.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
  /* Focus ring stays visible, just presents instantly. */
  :focus-visible { transition: none; }
}
```

Do **not** blanket `animation: none` — that removes functional feedback the user still needs.

## 6. Kinetic type (variable fonts)

When you animate a variable-font axis:

- Reserve inline space for the widest / boldest state (`min-width` or `letter-spacing` buffer) so the line does not reflow mid-morph.
- **Same axes in every keyframe**, same order (`"wght" 400, "wdth" 100`), or interpolation breaks and the font snaps.
- Subset the font — variable fonts are 2–3× the size of a static cut. Ship only the glyphs you use.
- Scroll-driven axis morph is the highest-value application: `animation-timeline: view()` or `scroll(root)` binds axis progress to scroll — zero JS.
- Under reduced motion, pin the axis to a balanced static value (e.g. `wght 400`) instead of removing the type.

## 7. Sound (opt-in via `--sound`)

Off by default. When on:

- **Howler.js sprite pack** for UI feedback (single file, zero-latency calls by name); optionally **Tone.js** for a reactive layer.
- **Earcon hierarchy** — Tier 1 alerts, Tier 2 primary actions, Tier 3 secondary feedback, Tier 4 ambient. Not every action gets a sound; hierarchy prevents noise.
- **Mute + volume controls visible on the page**, keyboard-reachable, with `aria-label`.
- **No autoplay with sound.** User gesture unlocks the audio context; unmute is opt-in.
- **Visual alternative for every audio cue** (users with partial hearing loss; users with sound off).
- Emphasize mid-frequencies; do not rely on high-frequency cues.
- Compress (MP3 / AAC / Ogg); lazy-load; ship via CDN with caching.

## 8. Modern platform (prefer over hand-rolled JS)

- **Scroll-Driven Animations** (`animation-timeline: view() | scroll()`) — off-main-thread, GPU-composited. Replaces most `IntersectionObserver` + `requestAnimationFrame` scroll handlers. Chrome 115+, Firefox 110+, Safari 17.4+/18+.
- **View Transitions API** — same-doc: `document.startViewTransition(fn)`; cross-doc MPA: `@view-transition { navigation: auto; }`. Zero JS for a native page morph. Pair morphs with `view-transition-name` on both source and target.
- **Container queries** (`@container`) — layout that responds to *the container*, not the viewport. Required for a portable component library.
- **`content-visibility: auto`** on off-screen sections for cheap render skipping.
- Feature-detect with `@supports` and provide a graceful static fallback.

## 9. Performance floor (Core Web Vitals)

- **LCP < 2.5 s** — hero image / headline paints fast. Preload the hero. Do not gate LCP behind JS.
- **INP < 200 ms** — every input responds within a frame budget. No blocking JS during interaction.
- **CLS < 0.1** — reserve space for every asynchronously loaded element (images with `width`/`height` or `aspect-ratio`; ads/embeds with a fixed slot; fonts with `size-adjust`).
- **JS off the critical path** — HTML delivers content; CSS presents; JS enhances. Defer heavy modules; lazy-load below-fold WebGL.
- **`FMP` is dead** — Lighthouse removed it in 6.0. Optimize for LCP + INP + CLS.

## 10. What "shipped by a design engineer" looks like on inspect

Open DevTools on a top-tier site (Vercel, Linear, Locomotive, Rauno's Devouring Details) and you will see:

- CSS custom properties for every color, radius, shadow, timing (not raw hex all over).
- `:focus-visible` rules with real style, not `outline: 0`.
- `::selection` styled with brand.
- `prefers-reduced-motion` media block present.
- `data-*` attributes for state (`data-state="open"`), styled via attribute selectors.
- No inline styles for anything animated; all in CSS keyframes or WAAPI.
- ARIA where the semantic HTML cannot carry it alone.

If your reimagined output has none of these signals, it is not clearing the floor. Add them.

---

## Verification checklist (add to §5.b of the SKILL)

After rendering the hero into a PNG (headless Chrome), also open the page in a real browser and check:

- [ ] Tab through every interactive element — focus ring visible at ≥ 3:1 contrast on every state.
- [ ] Hover every button / link / card — 100–150 ms `ease-out` transform response, no flash.
- [ ] Select some heading text — `::selection` is on-palette, not browser blue.
- [ ] System setting → Reduce Motion on → reload — animations settle instantly; focus and state feedback still work.
- [ ] Resize to 375 px wide — layout holds, no runaway columns, no clipped labels.
- [ ] Copy a value that triggers a copy affordance — inline checkmark at the trigger, not a toast.
- [ ] Submit a form with a bad value — the offending input highlights, not a banner.

If any of these fail, the redesign has not cleared the floor. Fix or downgrade to `partial`.
