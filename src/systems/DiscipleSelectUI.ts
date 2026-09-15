import * as Phaser from 'phaser';
import { state, gameStateManager } from '../state/GameState';

export class DiscipleSelectUI {
    private scene: Phaser.Scene;
    private portraits: Phaser.GameObjects.Rectangle[] = [];
    private highlight: Phaser.GameObjects.Rectangle;
    private container: Phaser.GameObjects.Container;
    
    private characterColors: Record<string, number> = {
        'peter': 0x4a90e2, // Blue
        'matthew': 0x550000 // Dark Red
    };

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        const width = this.scene.cameras.main.width;
        
        // Position at top-right, aligned with LessonHUD
        this.container = this.scene.add.container(width - 10, 10);
        this.container.setScrollFactor(0);
        this.container.setDepth(200);

        // Highlight for selected character
        this.highlight = this.scene.add.rectangle(0, 0, 26, 26, 0xffff00);
        this.highlight.setStrokeStyle(2, 0xffd700); // Gold highlight
        this.highlight.setFillStyle(); // Transparent fill
        this.container.add(this.highlight);

        this.refreshPortraits();

        // Input
        if (this.scene.input.keyboard) {
            this.scene.input.keyboard.on('keydown-TAB', this.cycleCharacter, this);
            this.scene.input.keyboard.on('keydown-C', this.cycleCharacter, this);
        }

        // Listen for unlock events or poll (for simplicity, we re-render on cycle, 
        // but ideally we'd refresh when a new character is unlocked)
        this.scene.events.on('update', this.checkUnlockUpdate, this);
    }
    
    private lastUnlockCount: number = 0;

    private checkUnlockUpdate() {
        if (state.unlockedDisciples.length !== this.lastUnlockCount) {
            this.refreshPortraits();
            this.lastUnlockCount = state.unlockedDisciples.length;
        }
    }

    private refreshPortraits() {
        // Clear old portraits
        this.portraits.forEach(p => p.destroy());
        this.portraits = [];

        const size = 20;
        const padding = 8;
        
        // Calculate total width of portraits to right-align them
        const totalWidth = state.unlockedDisciples.length * size + (state.unlockedDisciples.length - 1) * padding;

        state.unlockedDisciples.forEach((charId, index) => {
            // Draw from right to left
            const x = -totalWidth + (size + padding) * index + (size / 2);
            const y = size / 2;
            
            // Background shadow
            const shadow = this.scene.add.rectangle(x + 1, y + 1, size, size, 0x000000, 0.5);
            this.container.add(shadow);
            this.portraits.push(shadow);

            const color = this.characterColors[charId] || 0xaaaaaa;
            const portrait = this.scene.add.rectangle(x, y, size, size, color);
            portrait.setStrokeStyle(1, 0xdddddd);
            
            this.container.add(portrait);
            this.portraits.push(portrait);

            if (charId === state.activeCharacter) {
                this.highlight.setPosition(x, y);
                this.highlight.setDepth(201); // Ensure it's drawn over the portraits
            }
        });
    }

    private cycleCharacter() {
        if (state.unlockedDisciples.length <= 1) return;

        const currentIndex = state.unlockedDisciples.indexOf(state.activeCharacter);
        const nextIndex = (currentIndex + 1) % state.unlockedDisciples.length;
        
        state.activeCharacter = state.unlockedDisciples[nextIndex];
        gameStateManager.save();
        
        this.refreshPortraits();
        
        // Dispatch event for the scene to update the player avatar
        this.scene.events.emit('character-changed', state.activeCharacter, this.characterColors[state.activeCharacter]);
    }
}
