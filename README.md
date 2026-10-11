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
src/shared/          character model, graphics helpers and the sound engine used by every game
assets/              sounds and vendored libraries; credits are in ASSETS.md
tools/build.js       joins everything into dist/
server/server.js     serves dist/ and runs the multiplayer rooms
```

## Run it

```
npm install
npm run dev
```

Needs Node 18 or newer. Then open http://localhost:8080. `npm run dev` builds the game into `dist/` and starts the server; `npm run build` and `npm start` do the two halves separately.

## Playing together

When the game is served by `server/server.js`, everyone on the same link sees each other walk around the basement, with name tags, a bubble showing which cabinet someone is playing, and four emotes (keys 1 to 4, or the buttons top right).

- Add `?room=anything` to the link for a private room. The button showing who is here copies an invite link for the current room.
- Rooms hold up to 12 people. There are no accounts and no chat; names are the only free text other people see.
- The minigames themselves are still single player.

## Hosting

The server is one small Node process that serves the game and relays positions over a WebSocket at `/ws`, so any host that runs Node and allows WebSockets works. `render.yaml` sets it up on Render's free plan (New > Blueprint > pick this repo); the free plan sleeps when idle, so the first visit after a quiet spell takes a little while to wake.

## Build output

- `dist/index.html` is the full page the server serves, with multiplayer on.
- `dist/basement-arcade.html` is the same game as a single-file fragment with multiplayer off.

The served page uses the copy of three.js in `assets/vendor`; the single-file build loads it from cdnjs and has no sample files, so it plays simple synthesized sounds instead. Progress is saved in the browser under the `basement-v1` key.
