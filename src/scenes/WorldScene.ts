import * as Phaser from 'phaser';
import { DialogueManager } from '../systems/DialogueManager';
import type { DialogueTree } from '../systems/DialogueManager';

export class WorldScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    private dialogueManager!: DialogueManager;
    private dialogueTree!: DialogueTree;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasdKeys!: any;
    private playerSpeed: number = 100;

    constructor() {
        super('WorldScene');
    }

    create() {
        // Create a provisional map with placeholder 16-bit style tiles
        const tileSize = 32;
        const mapWidth = 384 * 2; // Make the world larger than the camera
        const mapHeight = 216 * 2;
        
        // Colors for Galilea/Judea representation (ochre/earth tones)
        const colors = [0xB08D57, 0xC19A6B, 0xA0785A, 0x8C6239];

        for (let y = 0; y < mapHeight; y += tileSize) {
            for (let x = 0; x < mapWidth; x += tileSize) {
                // Randomly pick one of the earth colors
                const color = colors[Math.floor(Math.random() * colors.length)];
                this.add.rectangle(x + tileSize / 2, y + tileSize / 2, tileSize, tileSize, color);
            }
        }

        // Set world bounds
        this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

        // Instantiate player (placeholder 16x24 rectangle)
        const rect = this.add.rectangle(mapWidth / 2, mapHeight / 2, 16, 24, 0x4a90e2);
        this.physics.add.existing(rect);
        this.player = rect as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
        this.player.body.setCollideWorldBounds(true);

        // Camera follow
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Keyboard input
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasdKeys = this.input.keyboard.addKeys('W,A,S,D');
            
            // Interaction key
            this.input.keyboard.on('keydown-E', () => {
                this.dialogueManager.showNode(this.dialogueTree['start']);
            });
        }

        // Initialize Dialogue System
        this.dialogueManager = new DialogueManager(this);
        this.dialogueManager.setOnChoiceSelect((nextNodeId) => {
            if (this.dialogueTree[nextNodeId]) {
                this.dialogueManager.showNode(this.dialogueTree[nextNodeId]);
            } else {
                this.dialogueManager.hide();
            }
        });

        // Test Dialogue Tree
        this.dialogueTree = {
            'start': {
                id: 'start',
                speakerId: 'prophet',
                text: 'Greetings, traveler. You seek answers, do you not?',
                avatar: '0xffaa00', // Orange-ish portrait
                choices: [
                    { text: 'Yes, I am lost.', nextNodeId: 'lost' },
                    { text: 'No, just passing by.', nextNodeId: 'passing' }
                ]
            },
            'lost': {
                id: 'lost',
                speakerId: 'prophet',
                text: 'The path is long, but the spirit is strong. Keep heading East.',
                avatar: '0xffaa00'
            },
            'passing': {
                id: 'passing',
                speakerId: 'prophet',
                text: 'Very well. May peace be with you.',
                avatar: '0xffaa00'
            }
        };
    }
    
    update() {
        if (!this.player || !this.player.body) return;

        // Reset velocity
        this.player.body.setVelocity(0);

        let velocityX = 0;
        let velocityY = 0;

        // Check horizontal movement
        if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
            velocityX = -this.playerSpeed;
        } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
            velocityX = this.playerSpeed;
        }

        // Check vertical movement
        if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
            velocityY = -this.playerSpeed;
        } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
            velocityY = this.playerSpeed;
        }

        // Normalize velocity to prevent faster diagonal movement
        if (velocityX !== 0 && velocityY !== 0) {
            const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
            velocityX = (velocityX / length) * this.playerSpeed;
            velocityY = (velocityY / length) * this.playerSpeed;
        }

        this.player.body.setVelocity(velocityX, velocityY);
    }
}
