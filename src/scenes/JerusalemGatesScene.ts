import * as Phaser from 'phaser';
import { DialogueManager } from '../systems/DialogueManager';
import type { DialogueTree } from '../systems/DialogueManager';
import { JournalManager } from '../systems/JournalManager';
import { DiscipleSelectUI } from '../systems/DiscipleSelectUI';
import { state, gameStateManager } from '../state/GameState';
import jerusalemGatesData from '../data/dialogues/jerusalem_gates.json';

export class JerusalemGatesScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    private dialogueManager!: DialogueManager;
    private journalManager!: JournalManager;
    private _discipleSelectUI!: DiscipleSelectUI;
    
    private dialogueTree: DialogueTree = jerusalemGatesData;
    private isDialogueActive: boolean = false;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasdKeys!: any;
    private playerSpeed: number = 100;
    
    public guardNPC!: Phaser.GameObjects.Rectangle;
    public pilgrimNPC!: Phaser.GameObjects.Rectangle;
    
    constructor() {
        super('JerusalemGatesScene');
    }

    create() {
        const width = 384;
        const height = 216;

        // Dusty path leading to the gates
        this.add.rectangle(width / 2, height / 2, width, height, 0xD2B48C);

        // Massive stone walls of Jerusalem
        this.add.rectangle(width / 2, 40, width, 80, 0x8B8989);
        this.add.rectangle(width / 2, 80, width, 10, 0x555555); // Wall detail
        
        // City Gate
        this.add.rectangle(width / 2, 70, 60, 60, 0x3d2314);

        // Roman Guard
        this.guardNPC = this.add.rectangle(width / 2 - 40, 90, 16, 24, 0xff0000);

        // Pilgrim
        this.pilgrimNPC = this.add.rectangle(width / 2 + 50, 120, 16, 24, 0x886644);

        // Physics Bounds
        this.physics.world.setBounds(0, 0, width, height);

        // Player (Starts near the bottom, coming from Galilee/Judea)
        const rect = this.add.rectangle(width / 2, height - 30, 16, 24, 0xffffff);
        this.physics.add.existing(rect);
        this.player = rect as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
        this.player.body.setCollideWorldBounds(true);

        // Character switch listener and initial color
        this.events.on('character-changed', (_charId: string, color: number) => {
            this.player.setFillStyle(color);
        });
        const charColor = state.activeCharacter === 'matthew' ? 0x550000 : 0x4a90e2;
        this.player.setFillStyle(charColor);

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

        this.dialogueManager.setOnChoiceSelect((nextNodeId, actionTrigger) => {
            if (actionTrigger) {
                this.handleNarrativeAction(actionTrigger);
            }
            
            // Branching based on active character traits
            if (nextNodeId === 'check_reading') {
                nextNodeId = state.activeCharacter === 'matthew' ? 'success_reading' : 'check_reading';
            }
            if (nextNodeId === 'check_humble') {
                nextNodeId = state.activeCharacter === 'peter' ? 'success_humble' : 'check_humble';
            }

            if (this.dialogueTree[nextNodeId]) {
                this.dialogueManager.showNode(this.dialogueTree[nextNodeId]);
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

        // Check distance to Guard
        if (Phaser.Math.Distance.Between(pX, pY, this.guardNPC.x, this.guardNPC.y) < 40) {
            this.isDialogueActive = true;
            this.dialogueManager.showNode(this.dialogueTree['start_guard']);
            return;
        }

        // Check distance to Pilgrim
        if (Phaser.Math.Distance.Between(pX, pY, this.pilgrimNPC.x, this.pilgrimNPC.y) < 40) {
            this.isDialogueActive = true;
            this.dialogueManager.showNode(this.dialogueTree['start_pilgrim']);
            return;
        }
    }

    private handleNarrativeAction(action: string) {
        if (action === 'read_edict') {
            if (!state.unlockedContexts.includes('roman_taxes')) {
                state.unlockedContexts.push('roman_taxes');
                gameStateManager.save();
                console.log('Unlocked context: roman_taxes');
            }
        } else if (action === 'comfort_pilgrim') {
            if (!state.unlockedPassages.includes('psalm_122')) {
                state.unlockedPassages.push('psalm_122');
                gameStateManager.save();
                console.log('Unlocked passage: psalm_122');
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
        
        // Edge transitions (left side goes to Capernaum, just for example connectivity)
        if (this.player.x <= 10) {
            this.scene.start('CapernaumScene');
        }
    }
}
