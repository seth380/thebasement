# Assets and credits

Everything in `assets/` was made by someone else and is used under the licence shown. Add a row here whenever a file is added.

| Files | Source | Author | Licence |
| --- | --- | --- | --- |
| `audio/engine`, `skid`, `impact` | [Starter Kit Racing](https://github.com/KenneyNL/Starter-Kit-Racing) | Kenney (kenney.nl) | CC0 |
| `audio/jump_a`, `jump_b`, `jump_c`, `land`, `steps`, `weapon` | [Starter Kit FPS](https://github.com/KenneyNL/Starter-Kit-FPS) | Kenney | CC0 |
| `audio/break`, `coin`, `hop`, `fall` | [Starter Kit 3D Platformer](https://github.com/KenneyNL/Starter-Kit-3D-Platformer) | Kenney | CC0 |
| `audio/place_*`, `remove_*` | [Starter Kit City Builder](https://github.com/KenneyNL/Starter-Kit-City-Builder) | Kenney | CC0 |
| `audio/tile_land`, `tile_match`, `tile_swap` | [Starter Kit Match-3](https://github.com/KenneyNL/Starter-Kit-Match-3) | Kenney | CC0 |
| `audio/bong`, `click`, `click2`, `close`, `confirm`, `drop`, `drop2`, `error`, `exit`, `glass`, `goal`, `join`, `leave`, `open`, `pluck`, `scrape`, `select`, `start`, `switch`, `tick`, `toggle`, `win` | [Interface Sounds](https://kenney.nl/assets/interface-sounds), via [Calinou/kenney-interface-sounds](https://github.com/Calinou/kenney-interface-sounds) | Kenney | CC0 |
| `models/characters/modular-men/*.glb` (11 characters) | [Ultimate Modular Men](https://quaternius.com/packs/ultimatemodularcharacters.html), Feb 2022 | Quaternius | CC0 |
| `models/npcs/mechs/*.glb` (George, Leela, Mike, Stan) | [Animated Mech Pack](https://quaternius.com/packs/animatedmech.html), March 2021, flat-colour version | Quaternius | CC0 |
| `models/nature/*` (35 models, 12 textures) | [Stylized Nature MegaKit](https://quaternius.com), free Standard edition | Quaternius | CC0 |
| `vendor/three.min.js`, `vendor/GLTFLoader.js`, `vendor/SkeletonUtils.js` | [three.js r128](https://github.com/mrdoob/three.js) | three.js authors | MIT |

The audio files were converted to mono mp3 and renamed; nothing else was changed.

The Quaternius models were changed only to make them lighter for the web: characters and mechs converted from glTF to `.glb` with unused animations removed; nature textures shrunk to 512 px, normal maps dropped, and the see-through parts of leaf textures filled with the leaf colour so distant trees don't go dark.

## Adding more

- Sounds go in `assets/audio/` as mp3. Add the name to the `FILES` list in `src/shared/sfx.js`, then call `SFX.play('name')`.
- Animated characters go in `assets/models/characters/` or `assets/models/npcs/`; see `assets/models/README.md`.
- Static 3D models go elsewhere under `assets/models/`. Load one with `GFX.model('folder/file.glb', model => scene.add(model))`.
- Only use CC0 or similarly permissive assets, and record them in the table above.
