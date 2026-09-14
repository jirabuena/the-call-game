import * as Phaser from 'phaser';

export interface DialogueChoice {
    text: string;
    nextNodeId: string;
    actionTrigger?: string;
}

export interface DialogueNode {
    id: string;
    speakerId: string;
    text: string;
    avatar: string; // Key to the avatar image or a hex color for placeholder
    choices?: DialogueChoice[];
}

export type DialogueTree = Record<string, DialogueNode>;

export class DialogueManager {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container;
    private background: Phaser.GameObjects.Graphics;
    private portrait: Phaser.GameObjects.Rectangle;
    private dialogueText: Phaser.GameObjects.Text;
    private choicesText: Phaser.GameObjects.Text[] = [];

    private isVisible: boolean = false;
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        // Configuration
        const width = scene.cameras.main.width - 20;
        const height = 64;
        const x = 10;
        const y = scene.cameras.main.height - height - 10;

        this.container = this.scene.add.container(x, y);
        this.container.setScrollFactor(0); // Make it stick to camera
        this.container.setDepth(100);

        // Background with retro border
        this.background = this.scene.add.graphics();
        this.background.fillStyle(0x000000, 0.8);
        this.background.fillRect(0, 0, width, height);
        this.background.lineStyle(2, 0xffffff, 1);
        this.background.strokeRect(0, 0, width, height);
        this.container.add(this.background);

        // Portrait placeholder
        this.portrait = this.scene.add.rectangle(24, 32, 32, 32, 0xaaaaaa);
        this.container.add(this.portrait);

        // Main text
        this.dialogueText = this.scene.add.text(48, 8, '', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#ffffff',
            wordWrap: { width: width - 56, useAdvancedWrap: true }
        });
        this.container.add(this.dialogueText);

        // Choices placeholders (up to 3)
        for (let i = 0; i < 3; i++) {
            const choiceText = this.scene.add.text(48, 30 + (i * 10), '', {
                fontFamily: 'monospace',
                fontSize: '10px',
                color: '#aaaaaa'
            });
            choiceText.setVisible(false);
            this.choicesText.push(choiceText);
            this.container.add(choiceText);
        }

        this.container.setVisible(false);

        // Input setup
        if (this.scene.input.keyboard) {
            this.scene.input.keyboard.on('keydown-SPACE', this.handleAdvance, this);
            this.scene.input.keyboard.on('keydown-ENTER', this.handleAdvance, this);
            this.scene.input.keyboard.on('keydown-UP', this.handleChoiceUp, this);
            this.scene.input.keyboard.on('keydown-DOWN', this.handleChoiceDown, this);
        }
    }

    private currentNode: DialogueNode | null = null;
    private currentTextIndex: number = 0;
    private typewriterTimer: Phaser.Time.TimerEvent | null = null;
    private isTyping: boolean = false;
    private typewriterSpeed: number = 30; // ms per character
    private selectedChoiceIndex: number = 0;
    private onChoiceSelect: ((nextNodeId: string, actionTrigger?: string) => void) | null = null;

    public setOnChoiceSelect(callback: (nextNodeId: string, actionTrigger?: string) => void) {
        this.onChoiceSelect = callback;
    }

    public hide() {
        this.container.setVisible(false);
        this.isVisible = false;
        if (this.typewriterTimer) {
            this.typewriterTimer.destroy();
        }
    }

    public showNode(node: DialogueNode) {
        this.currentNode = node;
        this.container.setVisible(true);
        this.isVisible = true;
        this.isTyping = true;
        
        // Hide choices initially
        this.choicesText.forEach(ct => ct.setVisible(false));
        
        this.dialogueText.setText('');
        this.currentTextIndex = 0;

        // Parse portrait color if provided as hex string, or use default
        if (node.avatar && node.avatar.startsWith('0x')) {
            this.portrait.setFillStyle(parseInt(node.avatar, 16));
        } else {
            this.portrait.setFillStyle(0xaaaaaa);
        }

        if (this.typewriterTimer) {
            this.typewriterTimer.destroy();
        }

        this.typewriterTimer = this.scene.time.addEvent({
            delay: this.typewriterSpeed,
            callback: this.typeChar,
            callbackScope: this,
            loop: true
        });
    }

    private typeChar() {
        if (!this.currentNode) return;
        
        this.currentTextIndex++;
        this.dialogueText.setText(this.currentNode.text.substring(0, this.currentTextIndex));
        
        if (this.currentTextIndex >= this.currentNode.text.length) {
            this.completeTyping();
        }
    }

    private completeTyping() {
        if (!this.currentNode) return;

        if (this.typewriterTimer) {
            this.typewriterTimer.destroy();
            this.typewriterTimer = null;
        }

        this.isTyping = false;
        this.dialogueText.setText(this.currentNode.text);

        // Show choices if available
        if (this.currentNode.choices && this.currentNode.choices.length > 0) {
            this.selectedChoiceIndex = 0;
            for (let i = 0; i < Math.min(3, this.currentNode.choices.length); i++) {
                const choice = this.currentNode.choices[i];
                const ct = this.choicesText[i];
                ct.setText(`> ${choice.text}`);
                ct.setVisible(true);
            }
            this.updateChoiceSelection();
        }
    }

    private handleAdvance() {
        if (!this.isVisible) return;

        if (this.isTyping) {
            this.completeTyping();
        } else if (this.currentNode && this.currentNode.choices && this.currentNode.choices.length > 0) {
            // Select choice
            const selectedChoice = this.currentNode.choices[this.selectedChoiceIndex];
            if (selectedChoice && this.onChoiceSelect) {
                this.onChoiceSelect(selectedChoice.nextNodeId, selectedChoice.actionTrigger);
            }
        } else {
            // End dialogue
            this.hide();
        }
    }

    private handleChoiceUp() {
        if (!this.isVisible || this.isTyping || !this.currentNode || !this.currentNode.choices) return;
        
        const maxChoices = Math.min(3, this.currentNode.choices.length);
        if (maxChoices > 1) {
            this.selectedChoiceIndex = (this.selectedChoiceIndex - 1 + maxChoices) % maxChoices;
            this.updateChoiceSelection();
        }
    }

    private handleChoiceDown() {
        if (!this.isVisible || this.isTyping || !this.currentNode || !this.currentNode.choices) return;
        
        const maxChoices = Math.min(3, this.currentNode.choices.length);
        if (maxChoices > 1) {
            this.selectedChoiceIndex = (this.selectedChoiceIndex + 1) % maxChoices;
            this.updateChoiceSelection();
        }
    }

    private updateChoiceSelection() {
        if (!this.currentNode || !this.currentNode.choices) return;
        const maxChoices = Math.min(3, this.currentNode.choices.length);
        
        for (let i = 0; i < maxChoices; i++) {
            const ct = this.choicesText[i];
            if (i === this.selectedChoiceIndex) {
                ct.setColor('#ffff00'); // Selected color (yellow)
            } else {
                ct.setColor('#aaaaaa'); // Unselected color (grey)
            }
        }
    }
}
