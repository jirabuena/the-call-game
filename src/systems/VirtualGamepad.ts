import * as Phaser from 'phaser';

export class VirtualGamepad {
    private scene: Phaser.Scene;
    private isTouchDevice: boolean;
    
    // Virtual state flags to be read by the scene
    public up: boolean = false;
    public down: boolean = false;
    public left: boolean = false;
    public right: boolean = false;
    public actionJustDown: boolean = false;
    public upJustDown: boolean = false;
    public downJustDown: boolean = false;

    private actionWasDown: boolean = false;
    private upWasDown: boolean = false;
    private downWasDown: boolean = false;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        
        // Detect touch capability
        this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth < 768);

        if (this.isTouchDevice) {
            this.createControls();
        }
    }

    private createControls() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        // Container to keep it organized and static on screen
        const container = this.scene.add.container(0, 0);
        container.setScrollFactor(0);
        container.setDepth(2000); // Always on top

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

            btn.on('pointerdown', () => {
                this[key] = true;
                if (key === 'up' && !this.upWasDown) {
                    this.upJustDown = true;
                    this.upWasDown = true;
                }
                if (key === 'down' && !this.downWasDown) {
                    this.downJustDown = true;
                    this.downWasDown = true;
                }
                btn.setAlpha(0.8);
            });
            btn.on('pointerup', () => {
                this[key] = false;
                if (key === 'up') this.upWasDown = false;
                if (key === 'down') this.downWasDown = false;
                btn.setAlpha(alpha);
            });
            btn.on('pointerout', () => {
                this[key] = false;
                if (key === 'up') this.upWasDown = false;
                if (key === 'down') this.downWasDown = false;
                btn.setAlpha(alpha);
            });
        };

        createBtn(baseX, baseY - size - 5, 'up');
        createBtn(baseX, baseY + size + 5, 'down');
        createBtn(baseX - size - 5, baseY, 'left');
        createBtn(baseX + size + 5, baseY, 'right');

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
            fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0.6);

        container.add([actionBtn, actionBorder, actionText]);

        actionBtn.on('pointerdown', () => {
            if (!this.actionWasDown) {
                this.actionJustDown = true;
            }
            this.actionWasDown = true;
            actionBtn.setAlpha(0.8);
        });

        actionBtn.on('pointerup', () => {
            this.actionWasDown = false;
            actionBtn.setAlpha(alpha);
        });

        actionBtn.on('pointerout', () => {
            this.actionWasDown = false;
            actionBtn.setAlpha(alpha);
        });
    }

    public update() {
        // Must be called in the scene's update loop to reset one-frame flags like actionJustDown
        // Scene should read actionJustDown *before* calling update() on the gamepad.
        this.actionJustDown = false;
        this.upJustDown = false;
        this.downJustDown = false;
    }
}
