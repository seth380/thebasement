# The Basement

A walk-around 3D basement in the browser. Arcade cabinets on the back wall launch minigames; the room itself has pool, foosball, chess, checkers, an aquarium, and a secret or two.

## Cabinets

| Cabinet | What it is |
| --- | --- |
| Turbo Meadow Kart | Kart, jet ski and plane racing across four events |
| Sundown Skate Park | Two-stick skating, two levels |
| Copper Canyon Range | Target range |
| Modern Waterfare | Water-gun team matches and a mud-monster survival mode, two maps |
| Fogbound Isle | A foggy island of puzzles and riddles |

## Layout

```
src/hub/index.html   page shell, styles and panels for the basement
src/hub/js/          the basement, one file per section, joined in name order
src/games/           one self-contained page per cabinet (Fogbound Isle is in parts)
src/shared/          character model and graphics helpers used by every game
tools/build.js       joins everything into dist/
```

## Build

```
npm run build
```

Needs Node 18 or newer. Output goes to `dist/`:

- `dist/index.html` is the full page.
- `dist/basement-arcade.html` is the same game as a single-file fragment.

The 3D library (three.js r128) loads from cdnjs. Progress is saved in the browser under the `basement-v1` key.
