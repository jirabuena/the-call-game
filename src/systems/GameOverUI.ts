import * as Phaser from 'phaser';
import { state } from '../state/GameState';
import { JournalManager } from './JournalManager';

export class GameOverUI {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container;
    private journalManager: JournalManager;

    constructor(scene: Phaser.Scene, journalManager: JournalManager) {
        this.scene = scene;
        this.journalManager = journalManager;

        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        this.container = this.scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(1000); // Above everything

        // Dark/Sepia background
        const bg = this.scene.add.rectangle(0, 0, width, height, 0x2b1d0f, 0.9).setOrigin(0);
        this.container.add(bg);

        // Reflection Text
        const textStr = state.language === 'pt' 
            ? "Pedro decidiu voltar à sua rotina comum.\nSem dar o passo de fé, a história do Evangelho não seguiu por este caminho..."
            : "Pedro decidió volver a su rutina común.\nSin dar el paso de fe, la historia del Evangelio no siguió por este camino...";

        const msgText = this.scene.add.text(width / 2, height / 3, textStr, {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#e0d4b4',
            align: 'center',
            lineSpacing: 4,
            wordWrap: { width: width - 40, useAdvancedWrap: true }
        }).setOrigin(0.5);
        this.container.add(msgText);

        // Restart Button
        const restartStr = state.language === 'pt' ? '[Recomeçar este Capítulo]' : '[Reiniciar este Capítulo]';
        const restartBtn = this.scene.add.text(width / 2, height / 2 + 20, restartStr, {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#444444',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        restartBtn.on('pointerdown', () => {
            // Restart the scene
            this.scene.scene.restart();
        });
        restartBtn.on('pointerover', () => restartBtn.setColor('#ffff00'));
        restartBtn.on('pointerout', () => restartBtn.setColor('#ffffff'));
        this.container.add(restartBtn);

        // Journal Button
        const journalStr = state.language === 'pt' ? '[Consultar o Diário]' : '[Consultar el Diario]';
        const journalBtn = this.scene.add.text(width / 2, height / 2 + 50, journalStr, {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#444444',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        journalBtn.on('pointerdown', () => {
            this.journalManager.toggle();
            // Move journal container above game over UI
            (this.journalManager as any).container.setDepth(1001);
        });
        journalBtn.on('pointerover', () => journalBtn.setColor('#ffff00'));
        journalBtn.on('pointerout', () => journalBtn.setColor('#ffffff'));
        this.container.add(journalBtn);

        this.container.setVisible(false);
    }

    public show() {
        this.container.setVisible(true);
        // Pause physics and stop player input (assumes player velocity reset handles stopping)
        this.scene.physics.world.isPaused = true;
    }
}
