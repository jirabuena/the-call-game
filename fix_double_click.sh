#!/bin/bash
node -e "
const fs = require('fs');
const path = require('path');
const scenesDir = path.join(__dirname, 'src/scenes');
const files = fs.readdirSync(scenesDir).filter(f => f.endsWith('Scene.ts') && !f.includes('Boot') && !f.includes('ChapterSelect') && !f.includes('MainMenu'));

for (const file of files) {
    const filePath = path.join(scenesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Currently we have this:
    // if (this.virtualGamepad && this.dialogueManager.isActive()) {
    //     this.dialogueManager.updateGamepadInput(this.virtualGamepad.actionJustDown, this.virtualGamepad.upJustDown, this.virtualGamepad.downJustDown);
    // }
    
    // We need to clear actionJustDown so it doesn't get processed AGAIN below in the interaction check
    
    if (content.includes('this.dialogueManager.updateGamepadInput(this.virtualGamepad.actionJustDown')) {
        content = content.replace(
            /this\.dialogueManager\.updateGamepadInput\(this\.virtualGamepad\.actionJustDown, this\.virtualGamepad\.upJustDown, this\.virtualGamepad\.downJustDown\);/,
            'this.dialogueManager.updateGamepadInput(this.virtualGamepad.actionJustDown, this.virtualGamepad.upJustDown, this.virtualGamepad.downJustDown);\n            this.virtualGamepad.actionJustDown = false; // Prevent double-triggering interaction'
        );
        
        // Also fix the duplicate OR conditions that sed accidentally created previously
        content = content.replace(/\|\| this\.virtualGamepad\?\.actionJustDown \|\| this\.virtualGamepad\?\.actionJustDown/g, '|| this.virtualGamepad?.actionJustDown');
        
        fs.writeFileSync(filePath, content, 'utf8');
    }
}
"
