import * as Phaser from 'phaser';
import { state, gameStateManager } from '../state/GameState';
import { DialogueManager } from '../systems/DialogueManager';
import { JournalManager } from '../systems/JournalManager';
import { LessonHUD } from '../systems/LessonHUD';
import { GameOverUI } from '../systems/GameOverUI';
import { ChapterTitleManager } from '../systems/ChapterTitleManager';
import { DiscipleSelectUI } from '../systems/DiscipleSelectUI';

export class SeaOfGalileeScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private jesus!: Phaser.Physics.Arcade.Sprite;
    private net!: Phaser.Physics.Arcade.Sprite;
    private interactKey!: Phaser.Input.Keyboard.Key;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: any;
    
    private dialogueManager!: DialogueManager;
    private journalManager!: JournalManager;
    private lessonHUD!: LessonHUD;
    private gameOverUI!: GameOverUI;
    private discipleUI!: DiscipleSelectUI;

    private speed = 80;
    
    // State 0: Must inspect empty net
    // State 1: Jesus says to cast net
    // State 2: Miracle happened, Jesus calls Peter
    private chapterState = 0; 
    
    // Fish graphics for the miracle
    private fishes: Phaser.GameObjects.Rectangle[] = [];

    constructor() {
        super('SeaOfGalileeScene');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background: 40% water (top), 60% land (bottom)
        const waterHeight = height * 0.4;
        
        // Procedural Water
        const waterBg = this.add.rectangle(0, 0, width, waterHeight, 0x1C3852).setOrigin(0);
        this.add.rectangle(0, waterHeight, width, 4, 0x285073).setOrigin(0);
        
        // Procedural Sand
        this.add.tileSprite(0, waterHeight, width, height - waterHeight, 'tex_sand').setOrigin(0);

        // --- POIs (Points of Interest) ---
        // A simple brown boat silhouette on the water edge
        this.add.rectangle(120, waterHeight - 10, 80, 20, 0x522C1A);
        this.add.rectangle(120, waterHeight - 25, 4, 40, 0x422216);

        // The Net (Interactable)
        this.net = this.physics.add.sprite(150, waterHeight + 10, 'tex_sand');
        this.net.setTint(0xD4AF37); // Gold/yellowish net color
        this.net.setImmovable(true);

        // --- Characters ---
        this.player = this.physics.add.sprite(40, height * 0.7, 'tex_sand');
        // Set Peter's color (blue)
        this.player.setTint(0x4a90e2);
        this.player.setCollideWorldBounds(true);
        this.player.body?.setSize(16, 16);

        this.jesus = this.physics.add.sprite(width / 2, height * 0.6, 'tex_sand');
        this.jesus.setTint(0xFFFFFF); // Jesus in white
        this.jesus.setImmovable(true);

        // Bounds - restrict to bottom 60%
        this.physics.world.setBounds(0, waterHeight, width, height - waterHeight);

        // Input
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasd = this.input.keyboard.addKeys('W,A,S,D');
            this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
            
            const jKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
            jKey.on('down', () => this.journalManager.toggle());
        }

        // Systems
        this.dialogueManager = new DialogueManager(this);
        this.journalManager = new JournalManager(this);
        this.lessonHUD = new LessonHUD(this, 3); // 3 steps: net -> miracle -> calling
        this.gameOverUI = new GameOverUI(this, this.journalManager);
        this.discipleUI = new DiscipleSelectUI(this);

        ChapterTitleManager.showTitle(this, 'Capítulo 2\nO Mar da Galileia', 'O milagre e o chamado de Pedro');
        this.setupDialogues();

        // Edge transition (Right side)
        this.physics.world.setBoundsCollision(true, false, true, true);
    }

    private setupDialogues() {
        const lang = state.language;

        // Net Dialogues
        this.dialogueManager.addNode('net_empty', {
            text: lang === 'pt' ? 'As redes estão vazias. Trabalhamos a noite toda e não pescamos nada.' : 'Las redes están vacías. Trabajamos toda la noche y no pescamos nada.',
            choices: [{ text: '...', nextNodeId: null, callback: () => {
                if (this.chapterState === 0) {
                    this.chapterState = 1;
                    this.lessonHUD.advanceProgress();
                    state.unlockedContexts.push('galilee_fishing');
                }
            }}]
        });

        // Jesus Dialogues
        this.dialogueManager.addNode('jesus_wait', {
            text: lang === 'pt' ? 'Jesus observa as águas.' : 'Jesús observa las aguas.',
            choices: [{ text: '...', nextNodeId: null }]
        });

        this.dialogueManager.addNode('jesus_command', {
            text: lang === 'pt' ? 'Jesus: Faze-te ao mar alto, e lançai as vossas redes para pescar.' : 'Jesús: Boga mar adentro, y echad vuestras redes para pescar.',
            choices: [
                { text: lang === 'pt' ? 'Mestre, sob a Tua palavra lançarei a rede.' : 'Maestro, en Tu palabra echaré la red.', nextNodeId: 'jesus_miracle' },
                { text: lang === 'pt' ? 'Estou cansado demais para tentar novamente.' : 'Estoy demasiado cansado para intentarlo de nuevo.', nextNodeId: 'jesus_fail' }
            ]
        });

        this.dialogueManager.addNode('jesus_miracle', {
            text: lang === 'pt' ? '(As redes se enchem de uma multidão de peixes!)' : '(¡Las redes se llenan de una multitud de peces!)',
            choices: [{ text: '...', nextNodeId: null, callback: () => {
                this.triggerMiracle();
                this.chapterState = 2;
                this.lessonHUD.advanceProgress();
            }}]
        });

        this.dialogueManager.addNode('jesus_fail', {
            text: lang === 'pt' ? 'Você se rendeu ao cansaço e duvidou da Palavra.' : 'Te rendiste al cansancio y dudaste de la Palabra.',
            choices: [{ text: 'Reiniciar', nextNodeId: null, callback: () => this.gameOverUI.show() }]
        });

        this.dialogueManager.addNode('peter_call', {
            text: lang === 'pt' ? 'Pedro: Senhor, ausenta-te de mim, por que sou um homem pecador.' : 'Pedro: Apártate de mí, Señor, porque soy hombre pecador.',
            choices: [{ text: lang === 'pt' ? 'Jesus: Não temas; de agora em diante serás pescador de homens.' : 'Jesús: No temas; desde ahora serás pescador de hombres.', nextNodeId: null, callback: () => {
                this.chapterState = 3;
                this.lessonHUD.advanceProgress();
                state.unlockedPassages.push('luke_5');
                gameStateManager.save();
            }}]
        });
    }

    private triggerMiracle() {
        // Spawn shiny procedural silver fish around the net
        for (let i = 0; i < 15; i++) {
            const rx = this.net.x + Phaser.Math.Between(-20, 20);
            const ry = this.net.y + Phaser.Math.Between(-10, 10);
            const fish = this.add.rectangle(rx, ry, 6, 3, 0xE0F0FF); // Silver/white
            this.fishes.push(fish);

            // Simple flop animation
            this.tweens.add({
                targets: fish,
                y: ry - Phaser.Math.Between(5, 15),
                rotation: Phaser.Math.FloatBetween(-0.5, 0.5),
                duration: Phaser.Math.Between(200, 400),
                yoyo: true,
                repeat: -1
            });
        }
    }

    update() {
        if (this.dialogueManager.isActive() || (this.journalManager as any).isVisible) {
            this.player.setVelocity(0);
            return;
        }

        // Movement
        let vx = 0;
        let vy = 0;

        if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -this.speed;
        if (this.cursors.right.isDown || this.wasd.D.isDown) vx = this.speed;
        if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -this.speed;
        if (this.cursors.down.isDown || this.wasd.S.isDown) vy = this.speed;

        this.player.setVelocity(vx, vy);
        if (vx !== 0 || vy !== 0) {
            this.player.y += Math.sin(this.time.now / 100) * 0.5;
        }

        // Interaction
        if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
            const distJesus = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.jesus.x, this.jesus.y);
            const distNet = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.net.x, this.net.y);

            if (distNet < 40) {
                this.dialogueManager.start('net_empty');
            } else if (distJesus < 40) {
                if (this.chapterState === 0) this.dialogueManager.start('jesus_wait');
                else if (this.chapterState === 1) this.dialogueManager.start('jesus_command');
                else if (this.chapterState === 2) this.dialogueManager.start('peter_call');
            }
        }

        // Transition
        if (this.player.x > this.cameras.main.width - 5) {
            if (this.lessonHUD.getProgress() === this.lessonHUD.getMaxProgress()) {
                state.currentChapter = 3;
                state.activeCharacter = 'peter'; // Keep Peter for now, or Zebedee scene? The prompt implies moving to Zebedee scene
                gameStateManager.save();
                this.scene.start('ZebedeeBoatScene');
            } else {
                this.player.x = this.cameras.main.width - 5;
            }
        }
    }
}
