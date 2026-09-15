import * as Phaser from 'phaser';
import { state } from '../state/GameState';

export class LessonHUD {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container;
    private progressBar: Phaser.GameObjects.Graphics;
    private feedbackText: Phaser.GameObjects.Text;
    
    private currentProgress: number = 0;
    private maxProgress: number = 5;

    constructor(scene: Phaser.Scene, maxSteps: number = 5) {
        this.scene = scene;
        this.maxProgress = maxSteps;

        const width = this.scene.cameras.main.width;
        // Moved higher up since DiscipleSelectUI is hidden
        this.container = this.scene.add.container(width - 10, 10);
        this.container.setScrollFactor(0);
        this.container.setDepth(200);

        this.progressBar = this.scene.add.graphics();
        this.container.add(this.progressBar);

        this.feedbackText = this.scene.add.text(0, 20, '', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(1, 0);
        this.feedbackText.setAlpha(0);
        this.container.add(this.feedbackText);

        this.drawProgressBar();
    }

    private drawProgressBar() {
        this.progressBar.clear();
        
        const barWidth = 100;
        const barHeight = 12;
        const padding = 2;
        
        // Offset to align to the right side
        const xOffset = -barWidth;

        // Background (empty track)
        this.progressBar.fillStyle(0x000000, 0.7);
        this.progressBar.fillRect(xOffset, 0, barWidth, barHeight);
        this.progressBar.lineStyle(1, 0xffffff, 0.5);
        this.progressBar.strokeRect(xOffset, 0, barWidth, barHeight);

        // Foreground (fill)
        if (this.currentProgress > 0) {
            const fillWidth = (this.currentProgress / this.maxProgress) * (barWidth - padding * 2);
            this.progressBar.fillStyle(0x00ff00, 1);
            this.progressBar.fillRect(xOffset + padding, padding, fillWidth, barHeight - padding * 2);
        }
    }

    public advanceProgress(amount: number = 1) {
        this.currentProgress = Math.min(this.maxProgress, this.currentProgress + amount);
        this.drawProgressBar();
        this.showFeedback();
    }

    public getProgress(): number {
        return this.currentProgress;
    }

    public getMaxProgress(): number {
        return this.maxProgress;
    }

    public showFeedback() {
        const msg = state.language === 'pt' ? 'Entendimento adquirido!' : '¡Entendimiento adquirido!';
        this.feedbackText.setText(msg);
        this.feedbackText.setAlpha(1);
        this.feedbackText.setY(20);

        this.scene.tweens.add({
            targets: this.feedbackText,
            y: 10,
            alpha: 0,
            duration: 1500,
            ease: 'Power2'
        });
    }
}
