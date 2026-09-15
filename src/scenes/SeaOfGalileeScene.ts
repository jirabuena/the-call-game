import * as Phaser from 'phaser';
import { DialogueManager } from '../systems/DialogueManager';
import type { DialogueTree } from '../systems/DialogueManager';
import { JournalManager } from '../systems/JournalManager';
import { ChapterTitleManager } from '../systems/ChapterTitleManager';
import callingPeterData_es from '../data/dialogues/calling_peter_es.json';
import callingPeterData_pt from '../data/dialogues/calling_peter_pt.json';
import triviaElderData_es from '../data/dialogues/trivia_elder_es.json';
import triviaElderData_pt from '../data/dialogues/trivia_elder_pt.json';
import { state } from '../state/GameState';
import { DiscipleSelectUI } from '../systems/DiscipleSelectUI';
import { LessonHUD } from '../systems/LessonHUD';
import { GameOverUI } from '../systems/GameOverUI';
import galileeEnvData_es from '../data/dialogues/galilee_env_es.json';
import galileeEnvData_pt from '../data/dialogues/galilee_env_pt.json';

export class SeaOfGalileeScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Sprite & { body: Phaser.Physics.Arcade.Body };
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasdKeys!: any;
    private playerSpeed: number = 100;
    
    public emptyNet!: Phaser.GameObjects.Sprite;
    public jesusNPC!: Phaser.GameObjects.Sprite & { body: Phaser.Physics.Arcade.Body };
    public elderNPC!: Phaser.GameObjects.Sprite;
    public basketsPOI!: Phaser.GameObjects.Sprite;
    public campfirePOI!: Phaser.GameObjects.Sprite;
    public fishermenPOI!: Phaser.GameObjects.Sprite;
    
    private waterBoundaryY: number = 86; // 40% of 216
    
    private dialogueManager!: DialogueManager;
    private journalManager!: JournalManager;
    private lessonHUD!: LessonHUD;
    private gameOverUI!: GameOverUI;
    private _discipleSelectUI!: DiscipleSelectUI;
    
    private callingPeterTree!: DialogueTree;
    private triviaElderTree!: DialogueTree;
    private envTree!: DialogueTree;
    private activeTree: DialogueTree | null = null;
    
    private isDialogueActive: boolean = false;
    private hasToldToFish: boolean = false;
    private hasCaughtFish: boolean = false;

    constructor() {
        super('SeaOfGalileeScene');
    }

    create() {
        const width = 384;
        const height = 216;

        // Water (top 40%)
        const waterHeight = this.waterBoundaryY;
        const water = this.add.tileSprite(width / 2, waterHeight / 2, width, waterHeight, 'tex_water');

        // Simple wave animation (moving texture)
        this.tweens.add({
            targets: water,
            tilePositionX: 32,
            tilePositionY: 16,
            duration: 4000,
            repeat: -1,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
        
        // Foam line at the edge
        const foam = this.add.rectangle(width / 2, waterHeight, width, 4, 0xffffff, 0.5);
        this.tweens.add({
            targets: foam,
            alpha: 0.2,
            scaleY: 1.5,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Sand shore (bottom 60%)
        this.add.tileSprite(width / 2, waterHeight + (height - waterHeight) / 2, width, height - waterHeight, 'tex_sand');

        // Wooden boat moored at the shore (top edge of sand)
        this.add.tileSprite(100, waterHeight + 5, 40, 20, 'tex_wood');

        // Empty fishing net (inside/near the boat)
        this.emptyNet = this.add.sprite(110, waterHeight + 5, 'tex_net');
        
        // Jesus NPC standing on the shore (scattered on sand)
        const jesusSprite = this.add.sprite(160, waterHeight + 30, 'tex_jesus');
        this.physics.add.existing(jesusSprite);
        this.jesusNPC = jesusSprite as Phaser.GameObjects.Sprite & { body: Phaser.Physics.Arcade.Body };

        // Elder NPC for trivia (bottom left)
        this.elderNPC = this.add.sprite(40, height - 30, 'tex_pilgrim');

        // Environmental POIs (scattered on sand)
        // Baskets (middle-right)
        this.basketsPOI = this.add.sprite(260, waterHeight + 50, 'tex_basket');
        // Campfire (bottom right corner)
        this.campfirePOI = this.add.sprite(width - 50, height - 30, 'tex_campfire'); 
        // Fishermen background (near the water, far right)
        this.fishermenPOI = this.add.sprite(width - 60, waterHeight + 15, 'tex_peter').setTint(0x888888);

        // Physics Bounds
        this.physics.world.setBounds(0, 0, width, height);

        // Player (Simon Peter initially) - spawn near boat on sand
        const playerSprite = this.add.sprite(100, waterHeight + 30, 'tex_peter');
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

        // Chapter Title
        const title = state.language === 'pt' ? 'Capítulo 1\nO Mar da Galileia' : 'Capítulo 1\nEl Mar de Galilea';
        const subtitle = state.language === 'pt' ? 'Lucas 5:1-11' : 'Lucas 5:1-11';
        ChapterTitleManager.showTitle(this, title, subtitle);

        // Load correct dialogue lang
        this.callingPeterTree = state.language === 'pt' ? callingPeterData_pt : callingPeterData_es;
        this.triviaElderTree = state.language === 'pt' ? triviaElderData_pt : triviaElderData_es;
        this.envTree = state.language === 'pt' ? galileeEnvData_pt : galileeEnvData_es;

        // Initialize Managers
        this.dialogueManager = new DialogueManager(this);
        this.journalManager = new JournalManager(this);
        this.lessonHUD = new LessonHUD(this, 3); // Max 3 lesson steps for this chapter: Elder, Told to fish, Join Jesus
        this.gameOverUI = new GameOverUI(this, this.journalManager);
        this._discipleSelectUI = new DiscipleSelectUI(this);

        // Character switch listener
        this.events.on('character-changed', (charId: string) => {
            this.player.setTexture(`tex_${charId}`);
        });

        // Ensure state starts with peter if this is the very beginning
        if (state.activeCharacter !== 'peter' && !state.unlockedDisciples.includes('matthew')) {
            state.activeCharacter = 'peter';
        }

        // Set initial texture based on active character
        this.player.setTexture(`tex_${state.activeCharacter}`);

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
            
            if (this.hasToldToFish && !this.hasCaughtFish) {
                this.dialogueManager.showNode({
                    id: 'net_interaction',
                    speakerId: 'peter',
                    text: state.language === 'pt' ? "A rede está a ponto de se romper de tantos peixes! É um milagre!" : "¡La red está a punto de romperse de tantos peces! ¡Es un milagro!",
                    avatar: '0x4a90e2',
                    choices: [{ text: state.language === 'pt' ? "[Recolher os peixes]" : "[Recoger los peces]", nextNodeId: 'end', actionTrigger: 'catch_fish' }]
                });
            } else if (this.hasCaughtFish) {
                this.dialogueManager.showNode({
                    id: 'net_interaction',
                    speakerId: 'peter',
                    text: state.language === 'pt' ? "A maior pesca da minha vida. Mas isso já não importa..." : "La pesca más grande de mi vida. Pero ya no importa...",
                    avatar: '0x4a90e2',
                    choices: [{ text: state.language === 'pt' ? "[Deixá-la para trás]" : "[Dejarla atrás]", nextNodeId: 'end' }]
                });
            } else {
                this.dialogueManager.showNode({
                    id: 'net_interaction',
                    speakerId: 'peter',
                    text: state.language === 'pt' ? "Vazia de novo. Pescamos a noite toda e não pegamos nada..." : "Vacía de nuevo. Hemos pescado toda la noche y no hemos sacado nada...",
                    avatar: '0x4a90e2',
                    choices: [{ text: state.language === 'pt' ? "[Deixá-la]" : "[Dejarla]", nextNodeId: 'end' }]
                });
            }
            return;
        }

        // Check distance to Jesus
        const distToJesus = Phaser.Math.Distance.Between(pX, pY, this.jesusNPC.x, this.jesusNPC.y);
        if (distToJesus < 40) {
            this.isDialogueActive = true;
            this.activeTree = this.callingPeterTree;
            
            if (this.hasCaughtFish && this.lessonHUD.getProgress() < this.lessonHUD.getMaxProgress() - 1) {
                // If caught fish but hasn't done other things, prompt to explore
                this.dialogueManager.showNode(this.activeTree['not_ready']);
            } else if (this.hasCaughtFish) {
                this.dialogueManager.showNode(this.activeTree['after_miracle']);
            } else {
                this.dialogueManager.showNode(this.activeTree['start']);
            }
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

        // Check POIs
        if (Phaser.Math.Distance.Between(pX, pY, this.basketsPOI.x, this.basketsPOI.y) < 30) {
            this.isDialogueActive = true;
            this.activeTree = this.envTree;
            this.dialogueManager.showNode(this.activeTree['baskets_start']);
            return;
        }
        if (Phaser.Math.Distance.Between(pX, pY, this.campfirePOI.x, this.campfirePOI.y) < 30) {
            this.isDialogueActive = true;
            this.activeTree = this.envTree;
            this.dialogueManager.showNode(this.activeTree['campfire_start']);
            return;
        }
        if (Phaser.Math.Distance.Between(pX, pY, this.fishermenPOI.x, this.fishermenPOI.y) < 40) {
            this.isDialogueActive = true;
            this.activeTree = this.envTree;
            this.dialogueManager.showNode(this.activeTree['fishermen_start']);
            return;
        }
    }

    private handleNarrativeAction(action: string) {
        if (action === 'told_to_fish') {
            this.hasToldToFish = true;
            this.lessonHUD.advanceProgress();
        } else if (action === 'catch_fish') {
            this.hasCaughtFish = true;
            // Visual feedback for miraculous catch
            this.emptyNet.setTint(0x88ff88); // Tint net green-ish to indicate it's full of fish
            
            // Add some fish sprites bouncing around the net
            for(let i=0; i<3; i++) {
                const fish = this.add.rectangle(this.emptyNet.x + (Math.random() * 10 - 5), this.emptyNet.y + (Math.random() * 10 - 5), 4, 2, 0xaaaaaa);
                this.tweens.add({
                    targets: fish,
                    y: fish.y - 10,
                    yoyo: true,
                    repeat: -1,
                    duration: 300 + Math.random() * 200
                });
            }
        } else if (action === 'join_jesus') {
            if (!state.unlockedDisciples.includes('peter')) {
                state.unlockedDisciples.push('peter');
                
                // Unlock passage
                if (!state.unlockedPassages.includes('luke_5')) {
                    state.unlockedPassages.push('luke_5');
                }
            }
            this.lessonHUD.advanceProgress();
            // Trigger Jesus to leave for the next scene
            this.jesusNPC.body.setVelocityX(50);
        } else if (action === 'trivia_correct') {
            state.scrolls += 1;
            if (!state.unlockedContexts.includes('galilee_fishing')) {
                state.unlockedContexts.push('galilee_fishing');
            }
            this.lessonHUD.advanceProgress();
        } else if (action === 'trigger_game_over') {
            this.dialogueManager.hide();
            this.gameOverUI.show();
        } else if (action === 'inspect_baskets') {
            if (!state.unlockedContexts.includes('roman_occupation')) {
                state.unlockedContexts.push('roman_occupation');
                this.lessonHUD.showFeedback();
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

        // Prevent walking into water
        if (this.player.y + (velocityY / 60) < this.waterBoundaryY + 12) {
            velocityY = Math.max(0, velocityY); // Only allow moving down if at boundary
            this.player.y = this.waterBoundaryY + 12;
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

        // Edge transition (Right side goes to Capernaum)
        if (this.player.x >= 365) {
            this.scene.start("ZebedeeBoatScene");
        }
    }
}
