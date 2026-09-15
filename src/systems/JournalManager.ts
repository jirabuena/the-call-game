import * as Phaser from 'phaser';
import { state } from '../state/GameState';

export class JournalManager {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container;
    private contentContainer: Phaser.GameObjects.Container;
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

    private scrollY: number = 0;
    private maxScroll: number = 0;
    private maskGraphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        const width = 340;
        const height = 180;
        const x = (this.scene.cameras.main.width - width) / 2;
        const y = (this.scene.cameras.main.height - height) / 2;

        this.container = this.scene.add.container(x, y);
        this.container.setScrollFactor(0);
        this.container.setDepth(1000); // Set depth high to cover other UI

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
        
        // Add interactivity to the background for scrolling
        const hitArea = new Phaser.Geom.Rectangle(0, 0, width, height);
        bg.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        bg.on('wheel', (pointer: Phaser.Input.Pointer, deltaX: number, deltaY: number) => {
            this.handleScroll(deltaY);
        });

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

        // Create a mask for the scrolling content
        const maskX = x + 5;
        const maskY = y + 30; // Below title
        const maskWidth = width - 10;
        const maskHeight = height - 35; // Leave room at top/bottom

        this.maskGraphics = this.scene.add.graphics();
        this.maskGraphics.fillStyle(0xffffff);
        this.maskGraphics.fillRect(maskX, maskY, maskWidth, maskHeight);
        
        // Create content container that will scroll
        this.contentContainer = this.scene.add.container(0, 30);
        this.contentContainer.setMask(new Phaser.Display.Masks.GeometryMask(this.scene, this.maskGraphics));
        this.container.add(this.contentContainer);

        // Sections inside content container
        const passagesLabel = state.language === 'pt' ? 'Glossário de Passagens:' : 'Glosario de Pasajes:';
        const passagesTitle = this.scene.add.text(10, 0, passagesLabel, {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#4A3018',
            fontStyle: 'bold'
        });
        this.contentContainer.add(passagesTitle);

        this.passagesText = this.scene.add.text(10, 15, '', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#4A3018',
            wordWrap: { width: width - 20, useAdvancedWrap: true }
        });
        this.contentContainer.add(this.passagesText);

        const contextsLabel = state.language === 'pt' ? 'Contexto Histórico:' : 'Contexto Histórico:';
        const contextsTitle = this.scene.add.text(10, 50, contextsLabel, { // Initial Y position, will update dynamically
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#4A3018',
            fontStyle: 'bold'
        });
        this.contentContainer.add(contextsTitle);

        this.contextsText = this.scene.add.text(10, 65, '', { // Initial Y position, will update dynamically
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#4A3018',
            wordWrap: { width: width - 20, useAdvancedWrap: true }
        });
        this.contentContainer.add(this.contextsText);

        this.container.setVisible(false);
        this.maskGraphics.setVisible(false); // Hide mask initially

        // Also add keyboard support for scrolling when visible
        if (this.scene.input.keyboard) {
            this.scene.input.keyboard.on('keydown-UP', () => { if(this.isVisible) this.handleScroll(-20); });
            this.scene.input.keyboard.on('keydown-DOWN', () => { if(this.isVisible) this.handleScroll(20); });
        }
    }

    private handleScroll(deltaY: number) {
        if (!this.isVisible) return;
        
        this.scrollY -= deltaY * 0.5; // Adjust scroll speed
        
        // Clamp scroll
        if (this.scrollY > 0) this.scrollY = 0;
        if (this.scrollY < -this.maxScroll) this.scrollY = -this.maxScroll;
        
        // Apply to container (base position 30)
        this.contentContainer.setY(30 + this.scrollY);
    }

    public toggle() {
        this.isVisible = !this.isVisible;
        
        if (this.isVisible) {
            this.scrollY = 0; // Reset scroll on open
            this.contentContainer.setY(30);
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

        // Dynamically position the context title and text based on passage text height
        const passageHeight = this.passagesText.height;
        const contextTitleY = 15 + passageHeight + 15;
        
        // Update context title position
        (this.contentContainer.getAt(2) as Phaser.GameObjects.Text).setY(contextTitleY);

        let cText = state.unlockedContexts.map(id => this.contextDatabase[id] ? this.contextDatabase[id][lang] : id).join('\n\n');
        if (!cText) cText = lang === 'pt' ? 'Ainda não há contexto histórico.' : 'Aún no hay contexto histórico.';
        this.contextsText.setText(cText);
        this.contextsText.setY(contextTitleY + 15);

        // Calculate max scroll
        const contentHeight = contextTitleY + 15 + this.contextsText.height;
        const visibleHeight = 180 - 35; // Container height - top margin
        
        this.maxScroll = Math.max(0, contentHeight - visibleHeight + 20); // +20 for bottom padding
    }
}
