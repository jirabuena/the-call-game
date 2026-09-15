import * as Phaser from 'phaser';
import { state } from '../state/GameState';

export class JournalManager {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container;
    private isVisible: boolean = false;
    
    private passagesText: Phaser.GameObjects.Text;
    private contextsText: Phaser.GameObjects.Text;
    private scrollsText: Phaser.GameObjects.Text;

    private passageDatabase: Record<string, { pt: string, es: string }> = {
        'luke_5': {
            es: 'Lucas 5:1-11 - La pesca milagrosa y el llamado de Simón Pedro.',
            pt: 'Lucas 5:1-11 - A pesca maravilhosa e o chamado de Simão Pedro.'
        },
        'matt_4': {
            es: 'Mateo 4:18-22 - El llamado a ser pescadores de hombres.',
            pt: 'Mateus 4:18-22 - O chamado para ser pescadores de homens.'
        },
        'matt_9': {
            es: 'Mateo 9:9-13 - El llamado de Mateo y la comida con pecadores.',
            pt: 'Mateus 9:9-13 - O chamado de Mateus e a refeição com os pecadores.'
        },
        'psalm_122': {
            es: 'Salmo 122:1 - "Yo me alegré con los que me decían: A la casa de Jehová iremos." Cántico de los peregrinos.',
            pt: 'Salmos 122:1 - "Alegrei-me quando me disseram: Vamos à casa do Senhor." Cântico dos peregrinos.'
        }
    };

    private contextDatabase: Record<string, { pt: string, es: string }> = {
        'galilee_fishing': {
            es: 'Contexto: Galilea era el centro de la industria pesquera. El pescado salado se exportaba por todo el Imperio Romano.',
            pt: 'Contexto: A Galileia era o centro da indústria pesqueira. O peixe salgado era exportado por todo o Império Romano.'
        },
        'roman_occupation': {
            es: 'Contexto: Roma imponía altos impuestos a los pescadores de Galilea.',
            pt: 'Contexto: Roma impunha altos impostos aos pescadores da Galileia.'
        },
        'publicans': {
            es: 'Los publicanos recaudaban impuestos para Roma. Eran odiados y considerados traidores y pecadores por sus compatriotas.',
            pt: 'Os publicanos arrecadavam impostos para Roma. Eram odiados e considerados traidores e pecadores por seus compatriotas.'
        },
        'roman_taxes': {
            es: 'Contexto: Los romanos y gobernantes locales (tetrarcas) cobraban peajes e impuestos en las entradas de las ciudades, frecuentemente abusivos.',
            pt: 'Contexto: Os romanos e governantes locais (tetrarcas) cobravam pedágios e impostos nas entradas das cidades, frequentemente abusivos.'
        }
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

        // Drop shadow
        const shadow = this.scene.add.graphics();
        shadow.fillStyle(0x000000, 0.5);
        shadow.fillRect(2, 2, width, height);
        this.container.add(shadow);

        // Background (Parchment color)
        const bg = this.scene.add.graphics();
        bg.fillStyle(0xF4E4BC, 1);
        bg.fillRect(0, 0, width, height);
        
        // Double border for parchment look
        bg.lineStyle(2, 0x8C6239, 1);
        bg.strokeRect(0, 0, width, height);
        bg.lineStyle(1, 0xA67249, 1);
        bg.strokeRect(3, 3, width - 6, height - 6);
        this.container.add(bg);

        // Title
        const titleText = state.language === 'pt' ? 'Diário do Caminho' : 'Diario del Camino';
        const title = this.scene.add.text(width / 2, 10, titleText, {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#4A3018',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        this.container.add(title);

        // Scrolls Count
        const scrollsLabel = state.language === 'pt' ? 'Pergaminhos:' : 'Pergaminos:';
        this.scrollsText = this.scene.add.text(width - 10, 10, `${scrollsLabel} 0`, {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#4A3018'
        }).setOrigin(1, 0);
        this.container.add(this.scrollsText);

        // Sections
        const passagesLabel = state.language === 'pt' ? 'Glossário de Passagens:' : 'Glosario de Pasajes:';
        const passagesTitle = this.scene.add.text(10, 30, passagesLabel, {
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

        const contextsLabel = state.language === 'pt' ? 'Contexto Histórico:' : 'Contexto Histórico:';
        const contextsTitle = this.scene.add.text(10, 100, contextsLabel, {
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
        const lang = state.language;
        const scrollsLabel = lang === 'pt' ? 'Pergaminhos' : 'Pergaminos';
        this.scrollsText.setText(`${scrollsLabel}: ${state.scrolls}`);

        let pText = state.unlockedPassages.map(id => this.passageDatabase[id] ? this.passageDatabase[id][lang] : id).join('\n\n');
        if (!pText) pText = lang === 'pt' ? 'Ainda não descobriste passagens.' : 'Aún no has descubierto pasajes.';
        this.passagesText.setText(pText);

        let cText = state.unlockedContexts.map(id => this.contextDatabase[id] ? this.contextDatabase[id][lang] : id).join('\n\n');
        if (!cText) cText = lang === 'pt' ? 'Ainda não há contexto histórico.' : 'Aún no hay contexto histórico.';
        this.contextsText.setText(cText);
    }
}
