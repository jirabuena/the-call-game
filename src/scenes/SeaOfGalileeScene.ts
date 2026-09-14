import * as Phaser from 'phaser';
import { DialogueManager } from '../systems/DialogueManager';
import type { DialogueTree } from '../systems/DialogueManager';
import { JournalManager } from '../systems/JournalManager';
import callingPeterData from '../data/dialogues/calling_peter.json';
import triviaElderData from '../data/dialogues/trivia_elder.json';
import { state } from '../state/GameState';

export class SeaOfGalileeScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasdKeys!: any;
    private playerSpeed: number = 100;
    
    public emptyNet!: Phaser.GameObjects.Rectangle;
    public jesusNPC!: Phaser.GameObjects.Rectangle;
    public elderNPC!: Phaser.GameObjects.Rectangle;
    public waterGraphics!: Phaser.GameObjects.Graphics;
    
    private dialogueManager!: DialogueManager;
    private journalManager!: JournalManager;
    
    private callingPeterTree: DialogueTree = callingPeterData;
    private triviaElderTree: DialogueTree = triviaElderData;
    private activeTree: DialogueTree | null = null;
    
    private isDialogueActive: boolean = false;

    constructor() {
        super('SeaOfGalileeScene');
    }

    create() {
        const width = 384;
        const height = 216;

        // Sand shore (left half)
        this.add.rectangle(width / 4, height / 2, width / 2, height, 0xEEDDAA);

        // Water (right half)
        this.waterGraphics = this.add.graphics();
        this.waterGraphics.fillStyle(0x4a90e2, 1);
        this.waterGraphics.fillRect(width / 2, 0, width / 2, height);

        // Simple wave animation (oscillating alpha)
        this.tweens.add({
            targets: this.waterGraphics,
            alpha: 0.8,
            yoyo: true,
            repeat: -1,
            duration: 2000,
            ease: 'Sine.easeInOut'
        });

        // Wooden boat moored at the shore
        this.add.rectangle(width / 2, height / 2, 40, 20, 0x8C6239);

        // Empty fishing net
        this.emptyNet = this.add.rectangle(width / 2 - 30, height / 2 + 20, 20, 20, 0xaaaaaa);
        
        // Jesus NPC standing on the shore
        this.jesusNPC = this.add.rectangle(width / 4, height / 4, 16, 24, 0xffffff);

        // Elder NPC for trivia
        this.elderNPC = this.add.rectangle(width / 4, height * 3 / 4, 16, 24, 0x884400);

        // Physics Bounds
        this.physics.world.setBounds(0, 0, width, height);

        // Player (Simon Peter)
        const rect = this.add.rectangle(width / 2 - 40, height / 2, 16, 24, 0x4a90e2);
        this.physics.add.existing(rect);
        this.player = rect as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
        this.player.body.setCollideWorldBounds(true);

        // Keyboard input
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasdKeys = this.input.keyboard.addKeys('W,A,S,D');
            
            this.input.keyboard.on('keydown-E', this.handleInteraction, this);
            this.input.keyboard.on('keydown-J', () => this.journalManager.toggle(), this);
        }

        // Initialize Managers
        this.dialogueManager = new DialogueManager(this);
        this.journalManager = new JournalManager(this);

        this.dialogueManager.setOnChoiceSelect((nextNodeId, actionTrigger) => {
            if (actionTrigger) {
                this.handleNarrativeAction(actionTrigger);
            }
            if (this.activeTree && this.activeTree[nextNodeId]) {
                this.dialogueManager.showNode(this.activeTree[nextNodeId]);
            } else {
                this.dialogueManager.hide();
                this.isDialogueActive = false;
                this.activeTree = null;
            }
        });
    }

    private handleInteraction() {
        if (this.isDialogueActive) return;

        const pX = this.player.x;
        const pY = this.player.y;

        // Check distance to net
        const distToNet = Phaser.Math.Distance.Between(pX, pY, this.emptyNet.x, this.emptyNet.y);
        if (distToNet < 30) {
            this.isDialogueActive = true;
            this.dialogueManager.showNode({
                id: 'net_interaction',
                speakerId: 'peter',
                text: "Empty again. We've fished all night and caught nothing...",
                avatar: '0x4a90e2',
                choices: [{ text: "[Leave it]", nextNodeId: 'end' }]
            });
            return;
        }

        // Check distance to Jesus
        const distToJesus = Phaser.Math.Distance.Between(pX, pY, this.jesusNPC.x, this.jesusNPC.y);
        if (distToJesus < 40) {
            this.isDialogueActive = true;
            this.activeTree = this.callingPeterTree;
            this.dialogueManager.showNode(this.activeTree['start']);
            return;
        }

        // Check distance to Elder
        const distToElder = Phaser.Math.Distance.Between(pX, pY, this.elderNPC.x, this.elderNPC.y);
        if (distToElder < 40) {
            this.isDialogueActive = true;
            this.activeTree = this.triviaElderTree;
            this.dialogueManager.showNode(this.activeTree['trivia_start']);
            return;
        }
    }

    private handleNarrativeAction(action: string) {
        if (action === 'catch_fish') {
            // Visual feedback for miraculous catch
            this.emptyNet.setFillStyle(0x00ff00); // Change net color to indicate it's full
            // Could add small fish sprites here
        } else if (action === 'join_jesus') {
            if (!state.unlockedDisciples.includes('peter')) {
                state.unlockedDisciples.push('peter');
                console.log('Unlocked disciples:', state.unlockedDisciples);
                
                // Unlock passage
                if (!state.unlockedPassages.includes('luke_5')) {
                    state.unlockedPassages.push('luke_5');
                }
            }
        } else if (action === 'trivia_correct') {
            state.scrolls += 1;
            if (!state.unlockedContexts.includes('galilee_fishing')) {
                state.unlockedContexts.push('galilee_fishing');
            }
            if (this.journalManager['isVisible']) {
                this.journalManager.toggle();
                this.journalManager.toggle(); // refresh hack
            }
        }
    }
    
    update() {
        if (!this.player || !this.player.body) return;

        this.player.body.setVelocity(0);
        if (this.isDialogueActive) return;

        let velocityX = 0;
        let velocityY = 0;

        if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
            velocityX = -this.playerSpeed;
        } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
            velocityX = this.playerSpeed;
        }

        if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
            velocityY = -this.playerSpeed;
        } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
            velocityY = this.playerSpeed;
        }

        if (velocityX !== 0 && velocityY !== 0) {
            const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
            velocityX = (velocityX / length) * this.playerSpeed;
            velocityY = (velocityY / length) * this.playerSpeed;
        }

        this.player.body.setVelocity(velocityX, velocityY);
    }
}
