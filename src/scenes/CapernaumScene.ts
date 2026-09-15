import * as Phaser from 'phaser';
import { DialogueManager } from '../systems/DialogueManager';
import type { DialogueTree } from '../systems/DialogueManager';
import { JournalManager } from '../systems/JournalManager';
import callingMatthewData from '../data/dialogues/calling_matthew.json';
import { state, gameStateManager } from '../state/GameState';
import { DiscipleSelectUI } from '../systems/DiscipleSelectUI';

export class CapernaumScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Sprite & { body: Phaser.Physics.Arcade.Body };
    private dialogueManager!: DialogueManager;
    private journalManager!: JournalManager;
    private _discipleSelectUI!: DiscipleSelectUI;
    
    private callingMatthewTree: DialogueTree = callingMatthewData;
    private isDialogueActive: boolean = false;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasdKeys!: any;
    private playerSpeed: number = 100;
    
    public taxTable!: Phaser.GameObjects.Rectangle;
    public jesusNPC!: Phaser.GameObjects.Sprite & { body: Phaser.Physics.Arcade.Body };
    
    constructor() {
        super('CapernaumScene');
    }

    create() {
        const width = 384;
        const height = 216;

        // Street background (Cobblestone)
        this.add.tileSprite(width / 2, height / 2, width, height, 'tex_cobble');

        // Limestone buildings
        this.add.rectangle(width / 4, height / 4, 120, 80, 0xEAE0C8).setStrokeStyle(2, 0xcabfa8);
        this.add.rectangle(width * 3 / 4, height / 4, 140, 90, 0xD4C5A9).setStrokeStyle(2, 0xb6a98f);

        // Market stall
        this.add.tileSprite(width * 3 / 4, height / 2 + 10, 60, 30, 'tex_wood');
        this.add.rectangle(width * 3 / 4, height / 2 - 10, 60, 10, 0xAA3333); // Awning

        // Tax booth (Customs office)
        this.add.rectangle(width / 4, height / 2 + 20, 50, 40, 0x555555); // Mat
        this.taxTable = this.add.rectangle(width / 4, height / 2 + 30, 40, 15, 0x5C4033);

        // Jesus NPC
        const jesusSprite = this.add.sprite(width / 2, height * 3 / 4, 'tex_jesus');
        this.physics.add.existing(jesusSprite);
        this.jesusNPC = jesusSprite as Phaser.GameObjects.Sprite & { body: Phaser.Physics.Arcade.Body };

        // Physics Bounds
        this.physics.world.setBounds(0, 0, width, height);

        // Force character change for the start of the chapter if Matthew is unlocked
        if (state.unlockedDisciples.includes('matthew')) {
            state.activeCharacter = 'matthew';
        }

        // Player (Matthew initially)
        const playerSprite = this.add.sprite(width / 4, height / 2 + 15, `tex_${state.activeCharacter || 'peter'}`);
        this.physics.add.existing(playerSprite);
        this.player = playerSprite as Phaser.GameObjects.Sprite & { body: Phaser.Physics.Arcade.Body };
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
        this._discipleSelectUI = new DiscipleSelectUI(this);

        // Character switch listener
        this.events.on('character-changed', (charId: string) => {
            this.player.setTexture(`tex_${charId}`);
        });

        // Set initial texture based on active character
        this.player.setTexture(`tex_${state.activeCharacter}`);

        this.dialogueManager.setOnChoiceSelect((nextNodeId, actionTrigger) => {
            if (actionTrigger) {
                this.handleNarrativeAction(actionTrigger);
            }
            if (this.callingMatthewTree[nextNodeId]) {
                this.dialogueManager.showNode(this.callingMatthewTree[nextNodeId]);
            } else {
                this.dialogueManager.hide();
                this.isDialogueActive = false;
            }
        });
    }

    private handleInteraction() {
        if (this.isDialogueActive) return;

        const pX = this.player.x;
        const pY = this.player.y;

        // Check distance to Jesus
        const distToJesus = Phaser.Math.Distance.Between(pX, pY, this.jesusNPC.x, this.jesusNPC.y);
        if (distToJesus < 40) {
            this.isDialogueActive = true;
            this.dialogueManager.showNode(this.callingMatthewTree['jesus_arrives']);
            return;
        }

        // Check distance to Tax Table
        const distToTable = Phaser.Math.Distance.Between(pX, pY, this.taxTable.x, this.taxTable.y);
        if (distToTable < 30) {
            this.isDialogueActive = true;
            this.dialogueManager.showNode(this.callingMatthewTree['start']);
            return;
        }
    }

    private handleNarrativeAction(action: string) {
        if (action === 'join_jesus_matthew') {
            if (!state.unlockedDisciples.includes('matthew')) {
                state.unlockedDisciples.push('matthew');
                
                // Unlock passage and context
                if (!state.unlockedPassages.includes('matt_9')) {
                    state.unlockedPassages.push('matt_9');
                }
                if (!state.unlockedContexts.includes('publicans')) {
                    state.unlockedContexts.push('publicans');
                }
                
                gameStateManager.save();
            }
            // Trigger Jesus to leave for the next scene
            this.jesusNPC.body.setVelocityX(50);
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

        // Simple walk animation (bobbing)
        if (velocityX !== 0 || velocityY !== 0) {
            this.player.setAngle(Math.sin(this.time.now / 100) * 10);
        } else {
            this.player.setAngle(0);
        }

        // Jesus bobbing
        if (this.jesusNPC.body && this.jesusNPC.body.velocity.x > 0) {
            this.jesusNPC.setAngle(Math.sin(this.time.now / 100) * 10);
        }

        // Edge transitions
        if (this.player.x <= 15) {
            this.scene.start('SeaOfGalileeScene');
        } else if (this.player.x >= 365) {
            this.scene.start('JerusalemGatesScene');
        }
    }
}
