#!/bin/bash
node -e "
const fs = require('fs');
const path = require('path');
const scenesDir = path.join(__dirname, 'src/scenes');
const files = fs.readdirSync(scenesDir).filter(f => f.endsWith('Scene.ts') && !f.includes('Boot') && !f.includes('ChapterSelect') && !f.includes('MainMenu'));

for (const file of files) {
    const filePath = path.join(scenesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Make sure we actually initialize the gamepad in create()
    if (content.includes('private virtualGamepad!: VirtualGamepad;') && !content.includes('this.virtualGamepad = new VirtualGamepad(this);')) {
        // We need to add it at the end of create(). Let's find the update() block and put it right before.
        content = content.replace(
            /    update\(\) \{/,
            '        this.virtualGamepad = new VirtualGamepad(this);\n    }\n\n    update() {'
        );
        fs.writeFileSync(filePath, content, 'utf8');
    }
}
"
