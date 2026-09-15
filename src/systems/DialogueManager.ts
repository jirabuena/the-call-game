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
    private boxWidth: number;
    private boxHeight: number;
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        // Configuration
        this.boxWidth = scene.cameras.main.width - 20;
        this.boxHeight = 110; // Increased height to fit long multiline choices
        const x = 10;
        const y = scene.cameras.main.height - this.boxHeight - 10;

        this.container = this.scene.add.container(x, y);
        this.container.setScrollFactor(0); // Make it stick to camera
        this.container.setDepth(100);

        // Drop shadow
        const shadow = this.scene.add.graphics();
        shadow.fillStyle(0x000000, 0.5);
        shadow.fillRect(2, 2, this.boxWidth, this.boxHeight);
        this.container.add(shadow);

        // Background with retro border
        this.background = this.scene.add.graphics();
        this.background.fillStyle(0x222222, 0.95);
        this.background.fillRect(0, 0, this.boxWidth, this.boxHeight);
        this.background.lineStyle(2, 0xd4c5a9, 1); // Gold-ish border
        this.background.strokeRect(0, 0, this.boxWidth, this.boxHeight);
        
        // Inner border for extra retro feel
        this.background.lineStyle(1, 0x555555, 1);
        this.background.strokeRect(4, 4, this.boxWidth - 8, this.boxHeight - 8);
        this.container.add(this.background);

        // Portrait placeholder
        this.portrait = this.scene.add.rectangle(24, 47, 32, 32, 0xaaaaaa);
        this.portrait.setStrokeStyle(1, 0xffffff); // Add a small border to the portrait
        this.container.add(this.portrait);

        // Main text
        this.dialogueText = this.scene.add.text(48, 10, '', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#eae0c8', // Slightly off-white/parchment color
            lineSpacing: 2,
            wordWrap: { width: this.boxWidth - 56, useAdvancedWrap: true }
        });
        this.container.add(this.dialogueText);

        // Choices placeholders (up to 3)
        for (let i = 0; i < 3; i++) {
            const choiceText = this.scene.add.text(48, 0, '', {
                fontFamily: 'monospace',
                fontSize: '10px',
                color: '#aaaaaa',
                lineSpacing: 2,
                wordWrap: { width: this.boxWidth - 56, useAdvancedWrap: true }
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
            
            // Calculate dynamic Y position based on dialogue text height
            // We add some padding below the main text
            const textHeight = this.dialogueText.height;
            let currentY = 10 + textHeight + 6;

            for (let i = 0; i < Math.min(3, this.currentNode.choices.length); i++) {
                const choice = this.currentNode.choices[i];
                const ct = this.choicesText[i];
                ct.setText(`> ${choice.text}`);
                
                // If it goes out of bounds, push it up (simple clamp)
                if (currentY + ct.height > this.boxHeight - 4) {
                     currentY = this.boxHeight - ct.height - 4;
                }
                
                ct.setY(currentY);
                ct.setVisible(true);
                
                // Add the actual rendered height of this choice text for the next item's position
                currentY += ct.height + 2; 
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
            // If there are no choices (like "end" node), space should just hide the dialogue
            // Or if we need to dispatch a generic "continue" action we could do it here
            // But since nodes without choices are dead-ends in our JSON, hide is correct
            
            // Check if there was an actionTrigger on this terminal node
            // Wait, action triggers are on choices, not on the node itself in our interface.
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
