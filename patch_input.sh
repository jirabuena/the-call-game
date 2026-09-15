#!/bin/bash
for file in /app/src/scenes/*Scene.ts; do
    if [[ "$file" == *"BootScene"* ]] || [[ "$file" == *"MainMenuScene"* ]] || [[ "$file" == *"ChapterSelectScene"* ]]; then
        continue
    fi

    # Replace movement checks
    sed -i 's/this.cursors.left.isDown || this.wasd.A.isDown/this.cursors.left.isDown || this.wasd.A.isDown || this.virtualGamepad?.left/g' "$file"
    sed -i 's/this.cursors.right.isDown || this.wasd.D.isDown/this.cursors.right.isDown || this.wasd.D.isDown || this.virtualGamepad?.right/g' "$file"
    sed -i 's/this.cursors.up.isDown || this.wasd.W.isDown/this.cursors.up.isDown || this.wasd.W.isDown || this.virtualGamepad?.up/g' "$file"
    sed -i 's/this.cursors.down.isDown || this.wasd.S.isDown/this.cursors.down.isDown || this.wasd.S.isDown || this.virtualGamepad?.down/g' "$file"
    
    # Using wasdKeys in ZebedeeBoatScene and JordanRiverScene
    sed -i 's/this.cursors.left.isDown || this.wasdKeys.A.isDown/this.cursors.left.isDown || this.wasdKeys.A.isDown || this.virtualGamepad?.left/g' "$file"
    sed -i 's/this.cursors.right.isDown || this.wasdKeys.D.isDown/this.cursors.right.isDown || this.wasdKeys.D.isDown || this.virtualGamepad?.right/g' "$file"
    sed -i 's/this.cursors.up.isDown || this.wasdKeys.W.isDown/this.cursors.up.isDown || this.wasdKeys.W.isDown || this.virtualGamepad?.up/g' "$file"
    sed -i 's/this.cursors.down.isDown || this.wasdKeys.S.isDown/this.cursors.down.isDown || this.wasdKeys.S.isDown || this.virtualGamepad?.down/g' "$file"

    # Replace interact check
    sed -i 's/Phaser.Input.Keyboard.JustDown(this.interactKey)/Phaser.Input.Keyboard.JustDown(this.interactKey) || this.virtualGamepad?.actionJustDown/g' "$file"
    
    # Inject virtualGamepad update
    sed -i '/if (this.dialogueManager.isActive()/i \        if (this.virtualGamepad) this.virtualGamepad.update();' "$file"
    
done
