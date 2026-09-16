#!/bin/bash
cat << 'INNER_EOF' > src/systems/VirtualGamepad.ts.patch
<<<<<<< SEARCH
        const alpha = 0.5;
        const size = 30; // Button size
        const padding = 10;
        
        // D-PAD positioning (Bottom Left)
        const baseX = padding + size * 1.5;
        const baseY = height - padding - size * 1.5;

        // Create D-PAD buttons
        const createBtn = (x: number, y: number, key: 'up' | 'down' | 'left' | 'right') => {
            const btn = this.scene.add.rectangle(x, y, size, size, 0xffffff, alpha);
            btn.setInteractive();
            
            // Draw arrow
            const gfx = this.scene.add.graphics();
            gfx.lineStyle(2, 0x000000, 1);
            if (key === 'up') { gfx.moveTo(x - 5, y + 5); gfx.lineTo(x, y - 5); gfx.lineTo(x + 5, y + 5); }
            if (key === 'down') { gfx.moveTo(x - 5, y - 5); gfx.lineTo(x, y + 5); gfx.lineTo(x + 5, y - 5); }
            if (key === 'left') { gfx.moveTo(x + 5, y - 5); gfx.lineTo(x - 5, y); gfx.lineTo(x + 5, y + 5); }
            if (key === 'right') { gfx.moveTo(x - 5, y - 5); gfx.lineTo(x + 5, y); gfx.lineTo(x - 5, y + 5); }
            gfx.strokePath();

            container.add([btn, gfx]);
=======
        const alpha = 0.2; // Make buttons more transparent (cleaner)
        const size = 24; // Smaller button size so they don't cover text
        const padding = 5;
        
        // D-PAD positioning (Bottom Left)
        // Move them slightly lower and more to the edge
        const baseX = padding + size * 1.5;
        const baseY = height - padding - size * 1.5;

        // Create D-PAD buttons
        const createBtn = (x: number, y: number, key: 'up' | 'down' | 'left' | 'right') => {
            // Using circles instead of solid squares for a cleaner, modern mobile look
            const btn = this.scene.add.circle(x, y, size / 1.5, 0xffffff, alpha);
            btn.setInteractive();
            
            // Draw a subtle arrow
            const gfx = this.scene.add.graphics();
            gfx.lineStyle(2, 0xffffff, 0.6); // White outline, slightly transparent
            
            const offset = 4;
            if (key === 'up') { gfx.moveTo(x - offset, y + offset); gfx.lineTo(x, y - offset); gfx.lineTo(x + offset, y + offset); }
            if (key === 'down') { gfx.moveTo(x - offset, y - offset); gfx.lineTo(x, y + offset); gfx.lineTo(x + offset, y - offset); }
            if (key === 'left') { gfx.moveTo(x + offset, y - offset); gfx.lineTo(x - offset, y); gfx.lineTo(x + offset, y + offset); }
            if (key === 'right') { gfx.moveTo(x - offset, y - offset); gfx.lineTo(x + offset, y); gfx.lineTo(x - offset, y + offset); }
            gfx.strokePath();

            container.add([btn, gfx]);
>>>>>>> REPLACE
<<<<<<< SEARCH
        // ACTION BUTTON (Bottom Right)
        const actionX = width - padding - size * 1.5;
        const actionY = height - padding - size * 1.5;

        const actionBtn = this.scene.add.circle(actionX, actionY, size * 0.8, 0xffffff, alpha);
        actionBtn.setInteractive();
        
        const actionText = this.scene.add.text(actionX, actionY, 'A', {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        container.add([actionBtn, actionText]);
=======
        // ACTION BUTTON (Bottom Right)
        const actionX = width - padding - size * 1.5;
        const actionY = height - padding - size * 1.5;

        const actionBtn = this.scene.add.circle(actionX, actionY, size, 0xffffff, alpha);
        actionBtn.setInteractive();
        
        // Add a subtle border to the A button to make it visible despite high transparency
        const actionBorder = this.scene.add.graphics();
        actionBorder.lineStyle(2, 0xffffff, 0.3);
        actionBorder.strokeCircle(actionX, actionY, size);
        
        const actionText = this.scene.add.text(actionX, actionY, 'A', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold',
            alpha: 0.6
        }).setOrigin(0.5);

        container.add([actionBtn, actionBorder, actionText]);
>>>>>>> REPLACE
INNER_EOF
