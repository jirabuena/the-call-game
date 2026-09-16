#!/bin/bash
node -e "
const fs = require('fs');
const files = ['src/scenes/SeaOfGalileeScene.ts', 'src/scenes/CapernaumTaxScene.ts', 'src/scenes/JerusalemGatesScene.ts'];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    
    // In Phaser scenes, the update() method usually comes after create()
    // We want to insert 'this.virtualGamepad = new VirtualGamepad(this);' right before the end of the create() method.
    // The safest way is to find the LAST occurrence of '    }' BEFORE '    update() {'
    
    const updateIdx = content.indexOf('    update() {');
    if (updateIdx !== -1) {
        const beforeUpdate = content.substring(0, updateIdx);
        const lastBraceIdx = beforeUpdate.lastIndexOf('    }');
        if (lastBraceIdx !== -1) {
            const before = beforeUpdate.substring(0, lastBraceIdx);
            const after = beforeUpdate.substring(lastBraceIdx); // this includes the '    }'
            content = before + '        this.virtualGamepad = new VirtualGamepad(this);\n' + after + content.substring(updateIdx);
            fs.writeFileSync(file, content, 'utf8');
        }
    }
}
"
