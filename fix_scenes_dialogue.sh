#!/bin/bash
node -e "
const fs = require('fs');
const path = require('path');
const scenesDir = path.join(__dirname, 'src/scenes');
const files = fs.readdirSync(scenesDir).filter(f => f.endsWith('Scene.ts') && !f.includes('Boot') && !f.includes('ChapterSelect') && !f.includes('MainMenu'));

for (const file of files) {
    const filePath = path.join(scenesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // We want to add:
    // if (this.virtualGamepad && this.dialogueManager.isActive()) {
    //     this.dialogueManager.updateGamepadInput(this.virtualGamepad.actionJustDown, this.virtualGamepad.upJustDown, this.virtualGamepad.downJustDown);
    // }
    // right before:
    // if (this.dialogueManager.isActive() || (this.journalManager as any).isVisible) {
    
    if (content.includes('if (this.dialogueManager.isActive() || (this.journalManager as any).isVisible) {') && !content.includes('this.dialogueManager.updateGamepadInput')) {
        content = content.replace(
            /        if \(this\.dialogueManager\.isActive\(\) \|\| \(this\.journalManager as any\)\.isVisible\) \{/,
            '        if (this.virtualGamepad && this.dialogueManager.isActive()) {\n            this.dialogueManager.updateGamepadInput(this.virtualGamepad.actionJustDown, this.virtualGamepad.upJustDown, this.virtualGamepad.downJustDown);\n        }\n\n        if (this.dialogueManager.isActive() || (this.journalManager as any).isVisible) {'
        );
        fs.writeFileSync(filePath, content, 'utf8');
    }
}
"
