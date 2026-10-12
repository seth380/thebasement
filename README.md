# The Basement

A walk-around 3D basement in the browser. Arcade cabinets on the back wall launch minigames; the room itself has pool, foosball, chess, checkers, an aquarium, and a secret or two. The stairs lead up to the house: a kitchen (pancakes, a fridge), a living room (sofa, TV, fireplace) and a bedroom (nap until morning, wardrobe).

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
assets/              sounds, character models and vendored libraries; credits are in ASSETS.md
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

## Hosting at home

The server runs on Node, not Python, so uvicorn won't run it. Install Node once:

1. Install the **LTS** version from https://nodejs.org (the default options are fine).
2. Get the code: `git clone https://github.com/seth380/thebasement` (or download the ZIP from GitHub and unzip it).
3. In that folder, run `npm install`, then `npm run dev`.
4. Open http://localhost:8080 on that computer.

**Other devices in the house:** open `http://<that computer's address>:8080` on the same Wi-Fi. Find the address with `ipconfig` on Windows (the IPv4 address) or in System Settings → Wi-Fi → Details on a Mac. Allow Node through the firewall if asked.

**Friends at their own houses:** either deploy to Render (below), or run a free Cloudflare quick tunnel while you play:

1. Install `cloudflared` from https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
2. With the game running, run `cloudflared tunnel --url http://localhost:8080`.
3. It prints a `https://….trycloudflare.com` link; send that. The link changes each time you start the tunnel and stops working when you close it.

After pulling new changes, stop the server (Ctrl+C) and run `npm run dev` again.

## Sharing a public link (Tailscale Funnel)

Funnel gives your PC a public `https://….ts.net` link that anyone can open, no app needed on their end. Because anyone with the link gets in, turn on the access code first.

1. Start the game with a code:
   ```
   npm run dev -- --code pick-any-word
   ```
2. In a second PowerShell window, run:
   ```
   tailscale funnel 8080
   ```
   The first time, Tailscale may print a link to switch Funnel on for your account; open it, approve, and run the command again. It then prints your public link.
3. Send people the link with the code on the end, e.g. `https://your-pc.your-tailnet.ts.net/?code=pick-any-word`. They go straight in, and their browser remembers it for 30 days. Anyone who opens the link without the code sees a box asking for it.

Add `&room=testers` to the link to keep testers in their own room. Stop sharing by closing the funnel window (Ctrl+C), or run `tailscale funnel reset`.

Your PC has to stay on with the game running while people play. Saves (trophies, coins, unlocks) live in each player's own browser.

## Hosting online

The server is one small Node process that serves the game and relays positions over a WebSocket at `/ws`, so any host that runs Node and allows WebSockets works. `render.yaml` sets it up on Render's free plan (New > Blueprint > pick this repo); the free plan sleeps when idle, so the first visit after a quiet spell takes a little while to wake.

## Build output

- `dist/index.html` is the full page the server serves, with multiplayer on.
- `dist/basement-arcade.html` is the same game as a single-file fragment with multiplayer off.

The served page uses the copy of three.js in `assets/vendor`; the single-file build loads it from cdnjs and has no sample files, so it plays simple synthesized sounds instead. Progress is saved in the browser under the `basement-v1` key.
