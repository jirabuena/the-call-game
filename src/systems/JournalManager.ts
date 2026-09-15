import * as Phaser from 'phaser';
import { state } from '../state/GameState';

export class JournalManager {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container;
    private isVisible: boolean = false;
    
    private passagesText: Phaser.GameObjects.Text;
    private contextsText: Phaser.GameObjects.Text;
    private scrollsText: Phaser.GameObjects.Text;

    private passageDatabase: Record<string, string> = {
        'luke_5': 'Lucas 5:1-11 - La pesca milagrosa y el llamado de Simón Pedro.',
        'matt_4': 'Mateo 4:18-22 - El llamado a ser pescadores de hombres.',
        'matt_9': 'Mateo 9:9-13 - El llamado de Mateo y la comida con pecadores.'
    };

    private contextDatabase: Record<string, string> = {
        'galilee_fishing': 'Contexto: Galilea era el centro de la industria pesquera. El pescado salado se exportaba por todo el Imperio Romano.',
        'roman_occupation': 'Contexto: Roma imponía altos impuestos a los pescadores de Galilea.',
        'publicans': 'Los publicanos recaudaban impuestos para Roma. Eran odiados y considerados traidores y pecadores por sus compatriotas.'
    };

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        const width = 340;
        const height = 180;
        const x = (this.scene.cameras.main.width - width) / 2;
        const y = (this.scene.cameras.main.height - height) / 2;

        this.container = this.scene.add.container(x, y);
        this.container.setScrollFactor(0);
        this.container.setDepth(200);

        // Background (Parchment color)
        const bg = this.scene.add.graphics();
        bg.fillStyle(0xF4E4BC, 1);
        bg.fillRect(0, 0, width, height);
        bg.lineStyle(2, 0x8C6239, 1);
        bg.strokeRect(0, 0, width, height);
        this.container.add(bg);

        // Title
        const title = this.scene.add.text(width / 2, 10, 'Diario del Camino', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#4A3018',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        this.container.add(title);

        // Scrolls Count
        this.scrollsText = this.scene.add.text(width - 10, 10, 'Pergaminos: 0', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#4A3018'
        }).setOrigin(1, 0);
        this.container.add(this.scrollsText);

        // Sections
        const passagesTitle = this.scene.add.text(10, 30, 'Glosario de Pasajes:', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#4A3018',
            fontStyle: 'bold'
        });
        this.container.add(passagesTitle);

        this.passagesText = this.scene.add.text(10, 45, '', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#4A3018',
            wordWrap: { width: width - 20, useAdvancedWrap: true }
        });
        this.container.add(this.passagesText);

        const contextsTitle = this.scene.add.text(10, 100, 'Contexto Histórico:', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#4A3018',
            fontStyle: 'bold'
        });
        this.container.add(contextsTitle);

        this.contextsText = this.scene.add.text(10, 115, '', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#4A3018',
            wordWrap: { width: width - 20, useAdvancedWrap: true }
        });
        this.container.add(this.contextsText);

        this.container.setVisible(false);
    }

    public toggle() {
        this.isVisible = !this.isVisible;
        
        if (this.isVisible) {
            this.updateContent();
            this.container.setVisible(true);
        } else {
            this.container.setVisible(false);
        }
    }

    private updateContent() {
        this.scrollsText.setText(`Pergaminos: ${state.scrolls}`);

        let pText = state.unlockedPassages.map(id => this.passageDatabase[id] || id).join('\n\n');
        if (!pText) pText = 'Aún no has descubierto pasajes.';
        this.passagesText.setText(pText);

        let cText = state.unlockedContexts.map(id => this.contextDatabase[id] || id).join('\n\n');
        if (!cText) cText = 'Aún no hay contexto histórico.';
        this.contextsText.setText(cText);
    }
}
