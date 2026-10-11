# Character models

Drop rigged, animated `.glb` or `.gltf` files here and run `npm run build`. Nothing else to edit.

- `characters/`: each file becomes a choice under **Change look → Character**.
- `npcs/`: the basement NPCs wear these, one each, in file-name order. With none here they stay as animals.

Subfolders are fine, so a whole pack folder can go in as it is. Keep any `Textures/` folder next to the files that use it.

**Names.** These come from the file name: `Casual_Male.gltf` becomes "Casual Male". To choose your own, add a `names.json` in the folder, e.g. `{"Casual_Male.gltf": "Sam"}`.

**Animations.** These are matched by name, so most packs work as they are: idle, walk, run, sit, wave, interact. A model with no sitting animation stands instead of sitting.

**Size.** Every model is scaled to the same height and stood on the floor.

**Credits.** Record every pack in `ASSETS.md`.
