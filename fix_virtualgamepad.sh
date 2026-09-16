#!/bin/bash
cat << 'INNER_EOF' > src/systems/VirtualGamepad.ts.patch
<<<<<<< SEARCH
    // Virtual state flags to be read by the scene
    public up: boolean = false;
    public down: boolean = false;
    public left: boolean = false;
    public right: boolean = false;
    public actionJustDown: boolean = false;

    private actionWasDown: boolean = false;
=======
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
>>>>>>> REPLACE
<<<<<<< SEARCH
            btn.on('pointerdown', () => { this[key] = true; btn.setAlpha(0.8); });
            btn.on('pointerup', () => { this[key] = false; btn.setAlpha(alpha); });
            btn.on('pointerout', () => { this[key] = false; btn.setAlpha(alpha); });
=======
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
>>>>>>> REPLACE
<<<<<<< SEARCH
    public update() {
        // Must be called in the scene's update loop to reset one-frame flags like actionJustDown
        // Scene should read actionJustDown *before* calling update() on the gamepad.
        this.actionJustDown = false;
    }
=======
    public update() {
        // Must be called in the scene's update loop to reset one-frame flags like actionJustDown
        // Scene should read actionJustDown *before* calling update() on the gamepad.
        this.actionJustDown = false;
        this.upJustDown = false;
        this.downJustDown = false;
    }
>>>>>>> REPLACE
INNER_EOF
