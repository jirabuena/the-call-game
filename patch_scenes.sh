#!/bin/bash
for file in /app/src/scenes/*Scene.ts; do
    # Skip non-gameplay scenes
    if [[ "$file" == *"BootScene"* ]] || [[ "$file" == *"MainMenuScene"* ]] || [[ "$file" == *"ChapterSelectScene"* ]]; then
        continue
    fi
    
    # 1. Import VirtualGamepad
    if ! grep -q "VirtualGamepad" "$file"; then
        sed -i '/import { DiscipleSelectUI }/a import { VirtualGamepad } from "../systems/VirtualGamepad";' "$file"
    fi

    # 2. Add property
    if ! grep -q "private virtualGamepad" "$file"; then
        sed -i '/private _discipleUI/a \    private virtualGamepad!: VirtualGamepad;' "$file"
        sed -i '/private discipleUI/a \    private virtualGamepad!: VirtualGamepad;' "$file"
    fi

    # 3. Instantiate in create()
    if ! grep -q "new VirtualGamepad" "$file"; then
        sed -i '/this.physics.world.setBoundsCollision/a \        this.virtualGamepad = new VirtualGamepad(this);' "$file"
    fi

    # 4. Handle transition logic generic replacement
    # We replace: if (this.player.x > this.cameras.main.width - 5) {
    # with logic that checks currentChapter and increments unlockedChapter
    # Actually, the unlockedChapter bump is easier done right before this.scene.start('NextScene')
done
