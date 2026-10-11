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
| `vendor/three.min.js`, `vendor/GLTFLoader.js` | [three.js r128](https://github.com/mrdoob/three.js) | three.js authors | MIT |

The audio files were converted to mono mp3 and renamed; nothing else was changed.

## Adding more

- Sounds go in `assets/audio/` as mp3. Add the name to the `FILES` list in `src/shared/sfx.js`, then call `SFX.play('name')`.
- 3D models go in `assets/models/` as `.glb`. Load one with `GFX.model('folder/file.glb', model => scene.add(model))`.
- Only use CC0 or similarly permissive assets, and record them in the table above.
