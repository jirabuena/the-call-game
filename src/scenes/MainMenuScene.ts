import * as Phaser from 'phaser';
import { state, gameStateManager } from '../state/GameState';

export class MainMenuScene extends Phaser.Scene {
    private titleText!: Phaser.GameObjects.Text;
    private controlsText!: Phaser.GameObjects.Text;
    private startText!: Phaser.GameObjects.Text;
    private langPtText!: Phaser.GameObjects.Text;
    private langEsText!: Phaser.GameObjects.Text;

    constructor() {
        super('MainMenuScene');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(0, 0, width, height, 0x111111).setOrigin(0);

        // Title
        this.titleText = this.add.text(width / 2, 40, '', {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#d4c5a9',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Language Selectors
        this.langPtText = this.add.text(width / 2 - 45, 75, 'Português', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: state.language === 'pt' ? '#ffff00' : '#888888'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.langEsText = this.add.text(width / 2 + 45, 75, 'Español', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: state.language === 'es' ? '#ffff00' : '#888888'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.langPtText.on('pointerdown', () => this.setLanguage('pt'));
        this.langEsText.on('pointerdown', () => this.setLanguage('es'));

        // Controls
        this.controlsText = this.add.text(width / 2, 130, '', {
            fontFamily: 'monospace',
            fontSize: '8px',
            color: '#aaaaaa',
            align: 'center',
            lineSpacing: 4
        }).setOrigin(0.5);

        // Start Button
        this.startText = this.add.text(width / 2, 185, '', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#444444',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.startText.on('pointerdown', () => {
            this.scene.start('JordanRiverScene');
        });
        
        this.startText.on('pointerover', () => this.startText.setBackgroundColor('#666666'));
        this.startText.on('pointerout', () => this.startText.setBackgroundColor('#444444'));

        this.updateTexts();
    }

    private setLanguage(lang: 'pt' | 'es') {
        state.language = lang;
        gameStateManager.save();
        
        this.langPtText.setColor(lang === 'pt' ? '#ffff00' : '#888888');
        this.langEsText.setColor(lang === 'es' ? '#ffff00' : '#888888');
        
        this.updateTexts();
    }

    private updateTexts() {
        const lang = state.language;
        
        this.titleText.setText(lang === 'pt' ? 'O Chamado' : 'El Llamado');
        
        const controls = lang === 'pt' 
            ? "[WASD / Setas] Mover\n[E] Interagir\n[J] Diário  |  [TAB / C] Trocar Apóstolo"
            : "[WASD / Flechas] Moverse\n[E] Interactuar\n[J] Diario  |  [TAB / C] Cambiar Apóstol";
        this.controlsText.setText(controls);
        
        this.startText.setText(lang === 'pt' ? 'Iniciar Jornada' : 'Iniciar Camino');
    }
}
