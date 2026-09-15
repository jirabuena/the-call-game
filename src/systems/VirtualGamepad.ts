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

    private actionWasDown: boolean = false;

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

            btn.on('pointerdown', () => { this[key] = true; btn.setAlpha(0.8); });
            btn.on('pointerup', () => { this[key] = false; btn.setAlpha(alpha); });
            btn.on('pointerout', () => { this[key] = false; btn.setAlpha(alpha); });
        };

        createBtn(baseX, baseY - size - 5, 'up');
        createBtn(baseX, baseY + size + 5, 'down');
        createBtn(baseX - size - 5, baseY, 'left');
        createBtn(baseX + size + 5, baseY, 'right');

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
    }
}
