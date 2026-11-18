# Owen's head

The cursor-following head on the homepage (`src/scripts/owen-head.ts`).

## Files

- `frames/` holds the source photos, one per direction. The number is the
  frame's position in the sprite:
  `0-center`, `1-up`, `2-up-right`, `3-right`, `4-down-right`, `5-down`,
  `6-down-left`, `7-left`, `8-up-left`.
- `cutouts/` holds the same frames with the background removed.
- `public/owen-head-sprite.webp` is built from `cutouts/`. Don't edit it by
  hand.

## Changing one frame

1. Make the new image. Everything came from ChatGPT (Images 2.6, Owen's
   subscription). Attach `frames/0-center.jpg` and use the prompt below with
   the direction filled in.
2. Save it over the matching file in `frames/`, for example
   `frames/3-right.jpg` (a square JPEG on a plain light-grey background).
3. Run `pnpm head:build 3-right`. This re-cuts that frame (macOS only) and
   rebuilds the sprite.
4. Check the homepage, then commit `frames/`, `cutouts/` and the sprite.

To rebuild without re-cutting anything, run `pnpm head:build`.

## Prompt

> Edit THIS attached photo only. It is the approved master: keep it identical
> in every way (same face, exact likeness, same attractive clear skin, same eyes
> and lids, same lips, same leopard hair and spots, one earring in the same ear,
> same light, same light-grey background, same framing and head size). The ONLY
> change: I turn my head slightly, about 12 degrees, and look **{direction}**.
> Both eyes fully visible, no profile. Do not redesign or re-age my face; it
> must still look exactly like this photo.

Generate each direction from the master on its own. Asking for every angle in
one grid image made the face drift.

## Adding or removing directions

`DIRECTIONS` in `src/scripts/owen-head.ts` and the `background-size` on
`.owen-head` in `src/styles/global.css` must match the number of frames minus
one (the centre frame).
