import * as Phaser from 'phaser';
import { state, gameStateManager } from '../state/GameState';

export class MainMenuScene extends Phaser.Scene {
    private titleText!: Phaser.GameObjects.Text;
    private controlsText!: Phaser.GameObjects.Text;
    private continueText!: Phaser.GameObjects.Text;
    private selectText!: Phaser.GameObjects.Text;
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
        this.titleText = this.add.text(width / 2, 30, '', {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#d4c5a9',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Language Selectors
        this.langPtText = this.add.text(width / 2 - 45, 65, 'Português', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: state.language === 'pt' ? '#ffff00' : '#888888'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.langEsText = this.add.text(width / 2 + 45, 65, 'Español', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: state.language === 'es' ? '#ffff00' : '#888888'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.langPtText.on('pointerdown', () => this.setLanguage('pt'));
        this.langEsText.on('pointerdown', () => this.setLanguage('es'));

        // Controls
        this.controlsText = this.add.text(width / 2, 110, '', {
            fontFamily: 'monospace',
            fontSize: '8px',
            color: '#aaaaaa',
            align: 'center',
            lineSpacing: 4
        }).setOrigin(0.5);

        // Buttons
        this.continueText = this.add.text(width / 2, 160, '', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#444444',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.continueText.on('pointerdown', () => {
            const scenes = [
                'JordanRiverScene', 'SeaOfGalileeScene', 'ZebedeeBoatScene', 'JohnCallingScene',
                'BethsaidaScene', 'UnderFigTreeScene', 'CapernaumTaxScene', 'ThomasDecisionScene',
                'JamesAlphaeusScene', 'SimonZealotScene', 'ThaddaeusScene', 'JudasIscariotScene'
            ];
            const targetIndex = state.unlockedChapter - 1;
            const targetScene = scenes[Math.min(targetIndex, scenes.length - 1)];
            
            state.currentChapter = state.unlockedChapter;
            gameStateManager.save();
            this.scene.start(targetScene);
        });
        this.continueText.on('pointerover', () => this.continueText.setBackgroundColor('#666666'));
        this.continueText.on('pointerout', () => this.continueText.setBackgroundColor('#444444'));

        this.selectText = this.add.text(width / 2, 190, '', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.selectText.on('pointerdown', () => {
            this.scene.start('ChapterSelectScene');
        });
        this.selectText.on('pointerover', () => this.selectText.setBackgroundColor('#555555'));
        this.selectText.on('pointerout', () => this.selectText.setBackgroundColor('#333333'));

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
            ? "[WASD / Setas] Mover  |  [E] Interagir\n[J] Diário  |  [TAB / C] Trocar Apóstolo\nControles de Toque para Mobile ativados"
            : "[WASD / Flechas] Moverse  |  [E] Interactuar\n[J] Diario  |  [TAB / C] Cambiar Apóstol\nControles Táctiles para Móvil activados";
        this.controlsText.setText(controls);
        
        const isNewGame = state.unlockedChapter === 1 && state.unlockedPassages.length === 0;
        this.continueText.setText(lang === 'pt' 
            ? (isNewGame ? 'Iniciar Jornada' : 'Continuar Jornada') 
            : (isNewGame ? 'Iniciar Camino' : 'Continuar Camino'));

        this.selectText.setText(lang === 'pt' ? 'Selecionar Capítulo' : 'Seleccionar Capítulo');
    }
}
