import * as Phaser from 'phaser';
import { state, gameStateManager } from '../state/GameState';
import { DialogueManager } from '../systems/DialogueManager';
import { JournalManager } from '../systems/JournalManager';
import { LessonHUD } from '../systems/LessonHUD';
import { GameOverUI } from '../systems/GameOverUI';
import { ChapterTitleManager } from '../systems/ChapterTitleManager';
import { DiscipleSelectUI } from '../systems/DiscipleSelectUI';

export class JordanRiverScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private johnBaptist!: Phaser.Physics.Arcade.Sprite;
    private jesus!: Phaser.Physics.Arcade.Sprite;
    private peterNPC!: Phaser.Physics.Arcade.Sprite;
    private interactKey!: Phaser.Input.Keyboard.Key;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: any;
    
    private dialogueManager!: DialogueManager;
    private journalManager!: JournalManager;
    private lessonHUD!: LessonHUD;
    private gameOverUI!: GameOverUI;
    
    private discipleUI!: DiscipleSelectUI;

    // State 0: Need to talk to John
    // State 1: Need to talk to Jesus
    // State 2: Need to tell Peter
    private chapterState = 0; 
    private speed = 80;

    constructor() {
        super('JordanRiverScene');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background: 40% water (top), 60% land (bottom)
        const waterHeight = height * 0.4;
        this.add.tileSprite(0, 0, width, waterHeight, "tex_water").setOrigin(0);
        this.add.tileSprite(0, waterHeight, width, height - waterHeight, "tex_sand").setOrigin(0);

        // Water reflection lines
        this.add.rectangle(0, waterHeight, width, 4, 0x285073).setOrigin(0);
        
        // --- Characters ---
        // Player (Andrew - green cloak placeholder)
        this.player = this.physics.add.sprite(100, height * 0.7, 'tex_andrew');
          
        this.player.setCollideWorldBounds(true);
        this.player.body?.setSize(16, 16);

        // John the Baptist (camel hair/brown)
        this.johnBaptist = this.physics.add.sprite(width / 2, height * 0.5, 'tex_john_baptist');
         
        this.johnBaptist.setImmovable(true);

        // Jesus (far away, white)
        this.jesus = this.physics.add.sprite(width * 0.8, height * 0.45, 'tex_jesus');
         
        this.jesus.setImmovable(true);

        // Peter (blue cloak, waiting at the edge)
        this.peterNPC = this.physics.add.sprite(width - 40, height * 0.8, 'tex_peter');
         
        this.peterNPC.setImmovable(true);
        this.peterNPC.setVisible(false); // Only visible later

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
        this.lessonHUD = new LessonHUD(this, 3);
        this.gameOverUI = new GameOverUI(this, this.journalManager);
        
        this.discipleUI = new DiscipleSelectUI(this);

        ChapterTitleManager.showTitle(this, "Capítulo 1\nÀs Margens do Jordão", "O chamado de André e Pedro");
        this.setupDialogues();

        // Edge transition (Right side)
        this.physics.world.setBoundsCollision(true, false, true, true);
    }

    private setupDialogues() {
        const lang = state.language;

        // John the Baptist Dialogues
        this.dialogueManager.addNode('john_0', {
            text: lang === 'pt' ? 'João Batista: Eis o Cordeiro de Deus, que tira o pecado do mundo!' : 'Juan el Bautista: ¡He aquí el Cordero de Dios, que quita el pecado del mundo!',
            choices: [
                { text: lang === 'pt' ? 'Seguir' : 'Seguir', nextNodeId: null, callback: () => {
                    this.chapterState = 1;
                    this.lessonHUD.advanceProgress();
                    state.unlockedContexts.push('john_baptist'); // Hypothetical context
                }}
            ]
        });

        // Jesus Dialogues
        this.dialogueManager.addNode('jesus_early', {
            text: lang === 'pt' ? 'Jesus caminha em silêncio.' : 'Jesús camina en silencio.',
            choices: [{ text: '...', nextNodeId: null }]
        });

        this.dialogueManager.addNode('jesus_call', {
            text: lang === 'pt' ? 'Jesus: Que buscais?' : 'Jesús: ¿Qué buscáis?',
            choices: [
                { text: lang === 'pt' ? 'Mestre, onde moras?' : 'Maestro, ¿dónde moras?', nextNodeId: 'jesus_call_accept' },
                { text: lang === 'pt' ? 'Não tenho certeza se devo deixar João.' : 'No estoy seguro de deber dejar a Juan.', nextNodeId: 'jesus_call_reject' }
            ]
        });

        this.dialogueManager.addNode('jesus_call_accept', {
            text: lang === 'pt' ? 'Jesus: Vinde e vede.' : 'Jesús: Venid y ved.',
            choices: [{ text: lang === 'pt' ? 'Ir até Pedro' : 'Ir hacia Pedro', nextNodeId: null, callback: () => {
                this.chapterState = 2;
                this.peterNPC.setVisible(true);
                this.lessonHUD.advanceProgress();
                state.unlockedPassages.push('john_1_35');
                gameStateManager.save();
            }}]
        });

        this.dialogueManager.addNode('jesus_call_reject', {
            text: lang === 'pt' ? 'Você hesitou em seguir a Verdade.' : 'Has dudado en seguir la Verdad.',
            choices: [{ text: lang === 'pt' ? 'Recomeçar' : 'Reiniciar', nextNodeId: null, callback: () => this.gameOverUI.show() }]
        });

        // Peter Dialogue
        this.dialogueManager.addNode('peter_found', {
            text: lang === 'pt' ? 'André: Achamos o Messias!' : 'Andrés: ¡Hemos hallado al Mesías!',
            choices: [{ text: lang === 'pt' ? 'Continuar para a Galileia' : 'Continuar a Galilea', nextNodeId: null, callback: () => {
                this.chapterState = 3;
                this.lessonHUD.advanceProgress();
                if (!state.unlockedDisciples.includes('peter')) {
                    state.unlockedDisciples.push("peter");
                    this.scene.start("SeaOfGalileeScene");
                    gameStateManager.save();
                }
            }}]
        });
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
            this.player.y += Math.sin(this.time.now / 100) * 0.5; // Bobbing
        }

        // Interaction
        if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
            const distJohn = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.johnBaptist.x, this.johnBaptist.y);
            const distJesus = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.jesus.x, this.jesus.y);
            const distPeter = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.peterNPC.x, this.peterNPC.y);

            if (distJohn < 40) {
                if (this.chapterState === 0) this.dialogueManager.start('john_0');
                else this.dialogueManager.start('john_0'); // Or a generic "He must increase"
            } else if (distJesus < 40) {
                if (this.chapterState === 0) this.dialogueManager.start('jesus_early');
                else if (this.chapterState === 1) this.dialogueManager.start('jesus_call');
            } else if (distPeter < 40 && this.peterNPC.visible) {
                if (this.chapterState === 2) this.dialogueManager.start('peter_found');
            }
        }

        // Transition
        if (this.player.x > this.cameras.main.width - 5) {
            if (this.lessonHUD.getProgress() === this.lessonHUD.getMaxProgress()) {
                state.currentChapter = 2;
                state.activeCharacter = 'peter'; // Switch to Peter for chapter 2
                gameStateManager.save();
                this.scene.start('SeaOfGalileeScene');
            } else {
                this.player.x = this.cameras.main.width - 5; // Block
            }
        }
    }
}
