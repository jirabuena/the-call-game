import * as Phaser from 'phaser';
import { state } from '../state/GameState';

export class LessonHUD {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container;
    private progressText: Phaser.GameObjects.Text;
    private feedbackText: Phaser.GameObjects.Text;
    
    private currentProgress: number = 0;
    private maxProgress: number = 5;

    constructor(scene: Phaser.Scene, maxSteps: number = 5) {
        this.scene = scene;
        this.maxProgress = maxSteps;

        this.container = this.scene.add.container(10, 40);
        this.container.setScrollFactor(0);
        this.container.setDepth(200);

        this.progressText = this.scene.add.text(0, 0, this.getProgressString(), {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#000000aa',
            padding: { x: 4, y: 2 }
        });
        this.container.add(this.progressText);

        this.feedbackText = this.scene.add.text(0, 20, '', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#00ff00',
            fontStyle: 'bold'
        });
        this.feedbackText.setAlpha(0);
        this.container.add(this.feedbackText);
    }

    private getProgressString() {
        const label = state.language === 'pt' ? 'Progresso da Lição:' : 'Progreso de la Lección:';
        return `${label} ${this.currentProgress}/${this.maxProgress}`;
    }

    public advanceProgress(amount: number = 1) {
        this.currentProgress = Math.min(this.maxProgress, this.currentProgress + amount);
        this.progressText.setText(this.getProgressString());
        this.showFeedback();
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
