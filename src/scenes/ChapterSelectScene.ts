import * as Phaser from 'phaser';
import { state, gameStateManager } from '../state/GameState';

const CHAPTERS = [
    { id: 1, titlePt: '1. O Cordeiro de Deus', titleEs: '1. El Cordero de Dios', scene: 'JordanRiverScene' },
    { id: 2, titlePt: '2. O Mar da Galileia', titleEs: '2. El Mar de Galilea', scene: 'SeaOfGalileeScene' },
    { id: 3, titlePt: '3. Remendando as Redes', titleEs: '3. Remendando las Redes', scene: 'ZebedeeBoatScene' },
    { id: 4, titlePt: '4. Filhos do Trovão', titleEs: '4. Hijos del Trueno', scene: 'JohnCallingScene' },
    { id: 5, titlePt: '5. A Encruzilhada', titleEs: '5. La Encrucijada', scene: 'BethsaidaScene' },
    { id: 6, titlePt: '6. Sob a Figueira', titleEs: '6. Bajo la Higuera', scene: 'UnderFigTreeScene' },
    { id: 7, titlePt: '7. A Coletoria', titleEs: '7. La Colecturía', scene: 'CapernaumTaxScene' },
    { id: 8, titlePt: '8. Coragem e Dúvida', titleEs: '8. Coraje y Duda', scene: 'ThomasDecisionScene' },
    { id: 9, titlePt: '9. O Trabalho Silencioso', titleEs: '9. El Trabajo Silencioso', scene: 'JamesAlphaeusScene' },
    { id: 10, titlePt: '10. Da Espada à Paz', titleEs: '10. De la Espada a la Paz', scene: 'SimonZealotScene' },
    { id: 11, titlePt: '11. A Pergunta Sincera', titleEs: '11. La Pregunta Sincera', scene: 'ThaddaeusScene' },
    { id: 12, titlePt: '12. O Tesoureiro', titleEs: '12. El Tesorero', scene: 'JudasIscariotScene' },
];

export class ChapterSelectScene extends Phaser.Scene {
    constructor() {
        super('ChapterSelectScene');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const lang = state.language;

        this.add.rectangle(0, 0, width, height, 0x111111).setOrigin(0);

        const titleText = lang === 'pt' ? 'Seleção de Capítulos' : 'Selección de Capítulos';
        this.add.text(width / 2, 20, titleText, {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#d4c5a9',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const backText = lang === 'pt' ? '[Voltar]' : '[Volver]';
        const backBtn = this.add.text(10, 10, backText, {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#aaaaaa'
        }).setInteractive({ useHandCursor: true });
        backBtn.on('pointerdown', () => this.scene.start('MainMenuScene'));
        backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
        backBtn.on('pointerout', () => backBtn.setColor('#aaaaaa'));

        // We will make a scrollable container or just page it. 
        // For 16-bit, paginating or simply drawing two columns works well.
        const startY = 50;
        const col1X = width / 4;
        const col2X = (width / 4) * 3;

        CHAPTERS.forEach((cap, index) => {
            const isUnlocked = cap.id <= state.unlockedChapter;
            const isCurrent = cap.id === state.unlockedChapter;
            
            const colX = index < 6 ? col1X : col2X;
            const rowY = startY + (index % 6) * 24;

            const textObj = this.add.text(colX, rowY, lang === 'pt' ? cap.titlePt : cap.titleEs, {
                fontFamily: 'monospace',
                fontSize: '10px',
                color: isCurrent ? '#ffff00' : (isUnlocked ? '#ffffff' : '#555555'),
            }).setOrigin(0.5);

            if (isUnlocked) {
                textObj.setInteractive({ useHandCursor: true });
                textObj.on('pointerover', () => { if(!isCurrent) textObj.setColor('#dddddd'); });
                textObj.on('pointerout', () => { if(!isCurrent) textObj.setColor('#ffffff'); });
                textObj.on('pointerdown', () => {
                    // Update current chapter state (but keep unlocked highest)
                    state.currentChapter = cap.id;
                    gameStateManager.save();
                    this.scene.start(cap.scene);
                });
            } else {
                // Locked icon
                this.add.text(colX - textObj.width/2 - 10, rowY, 'x', {
                    fontFamily: 'monospace', fontSize: '10px', color: '#ff0000'
                }).setOrigin(0.5);
            }
            
            if (cap.id < state.unlockedChapter) {
                // Completed icon
                this.add.text(colX - textObj.width/2 - 10, rowY, 'v', {
                    fontFamily: 'monospace', fontSize: '10px', color: '#00ff00'
                }).setOrigin(0.5);
            }
        });
    }
}
