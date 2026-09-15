import * as Phaser from 'phaser';
import { state, gameStateManager } from '../state/GameState';
import { DialogueManager } from '../systems/DialogueManager';
import { JournalManager } from '../systems/JournalManager';
import { LessonHUD } from '../systems/LessonHUD';
import { GameOverUI } from '../systems/GameOverUI';
import { ChapterTitleManager } from '../systems/ChapterTitleManager';
import { DiscipleSelectUI } from '../systems/DiscipleSelectUI';

export class CapernaumTaxScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private jesus!: Phaser.Physics.Arcade.Sprite;
    private taxTable!: Phaser.GameObjects.Rectangle;
    private interactKey!: Phaser.Input.Keyboard.Key;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: any;
    
    private dialogueManager!: DialogueManager;
    private journalManager!: JournalManager;
    private lessonHUD!: LessonHUD;
    private gameOverUI!: GameOverUI;
    private discipleUI!: DiscipleSelectUI;

    private speed = 80;
    
    // State 0: Must inspect coins on table
    // State 1: Jesus calls Matthew
    // State 2: Can leave
    private chapterState = 0; 

    constructor() {
        super('CapernaumTaxScene');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background: 40% stone wall (top), 60% stone street (bottom)
        const wallHeight = height * 0.4;
        
        this.add.rectangle(0, 0, width, wallHeight, 0x808080).setOrigin(0); // Stone wall
        this.add.rectangle(0, wallHeight, width, height - wallHeight, 0xA9A9A9).setOrigin(0); // Street

        // --- POIs ---
        // Tax Table
        this.taxTable = this.add.rectangle(width / 2 - 40, height * 0.6, 40, 20, 0x522C1A);
        this.physics.add.existing(this.taxTable, true);
        
        // Coins on table
        this.add.circle(this.taxTable.x - 5, this.taxTable.y - 5, 2, 0xFFD700);
        this.add.circle(this.taxTable.x + 5, this.taxTable.y, 2, 0xC0C0C0);
        this.add.circle(this.taxTable.x, this.taxTable.y + 5, 2, 0xFFD700);

        // Roman Soldier placeholder (uninteractable for now)
        this.add.rectangle(width - 50, wallHeight - 10, 16, 32, 0x8B0000); // Red cape

        // --- Characters ---
        // Player (Matthew - dark red)
        this.player = this.physics.add.sprite(width / 2 - 20, height * 0.6, 'tex_sand');
        this.player.setTint(0x550000);
        this.player.setCollideWorldBounds(true);
        this.player.body?.setSize(16, 16);

        // Jesus
        this.jesus = this.physics.add.sprite(60, height * 0.6, 'tex_sand');
        this.jesus.setTint(0xFFFFFF);
        this.jesus.setImmovable(true);

        this.physics.world.setBounds(0, wallHeight, width, height - wallHeight);

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
        this.lessonHUD = new LessonHUD(this, 2);
        this.gameOverUI = new GameOverUI(this, this.journalManager);
        this.discipleUI = new DiscipleSelectUI(this);

        ChapterTitleManager.showTitle(this, 'Capítulo 7\nA Coletoria de Cafarnaum', 'O chamado de Mateus, o publicano');
        this.setupDialogues();

        this.physics.world.setBoundsCollision(true, false, true, true);
        
        // Temporarily set active character to Matthew to reflect the scene correctly
        if (state.activeCharacter !== 'matthew' && state.unlockedDisciples.includes('matthew')) {
             // For testing purposes in isolated development, this works. In a full playthrough,
             // we'd probably have an intermediary selection screen or handle transitions better.
        }
    }

    private setupDialogues() {
        const lang = state.language;

        // Table
        this.dialogueManager.addNode('tax_table', {
            text: lang === 'pt' ? 'Moedas de imposto arrecadadas para Roma. Meus concidadãos me odeiam por isso.' : 'Monedas de impuestos recaudadas para Roma. Mis conciudadanos me odian por esto.',
            choices: [{ text: '...', nextNodeId: null, callback: () => {
                if (this.chapterState === 0) {
                    this.chapterState = 1;
                    this.lessonHUD.advanceProgress();
                    state.unlockedContexts.push('publicans');
                }
            }}]
        });

        this.dialogueManager.addNode('jesus_wait', {
            text: lang === 'pt' ? 'Jesus caminha pela rua movimentada.' : 'Jesús camina por la calle concurrida.',
            choices: [{ text: '...', nextNodeId: null }]
        });

        this.dialogueManager.addNode('jesus_call', {
            text: lang === 'pt' ? 'Jesus para diante da mesa e diz: "Segue-me".' : 'Jesús se detiene ante la mesa y dice: "Sígueme".',
            choices: [
                { text: lang === 'pt' ? 'Levantar-se e deixar tudo.' : 'Levantarse y dejar todo.', nextNodeId: 'jesus_accept' },
                { text: lang === 'pt' ? 'Preciso fechar o caixa primeiro.' : 'Necesito cerrar la caja primero.', nextNodeId: 'jesus_reject' }
            ]
        });

        this.dialogueManager.addNode('jesus_accept', {
            text: lang === 'pt' ? 'Mateus deixou tudo, levantou-se e O seguiu.' : 'Mateo dejándolo todo, se levantó y le siguió.',
            choices: [{ text: '...', nextNodeId: null, callback: () => {
                this.chapterState = 2;
                this.lessonHUD.advanceProgress();
                state.unlockedPassages.push('matt_9');
                if (!state.unlockedDisciples.includes('matthew')) {
                    state.unlockedDisciples.push('matthew');
                }
                gameStateManager.save();
            }}]
        });

        this.dialogueManager.addNode('jesus_reject', {
            text: lang === 'pt' ? 'Seu coração permaneceu apegado ao ouro de Roma.' : 'Tu corazón permaneció apegado al oro de Roma.',
            choices: [{ text: 'Reiniciar', nextNodeId: null, callback: () => this.gameOverUI.show() }]
        });
    }

    update() {
        if (this.dialogueManager.isActive() || (this.journalManager as any).isVisible) {
            this.player.setVelocity(0);
            return;
        }

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

        if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
            const distJesus = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.jesus.x, this.jesus.y);
            const distTable = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.taxTable.x, this.taxTable.y);

            if (distTable < 40) {
                this.dialogueManager.start('tax_table');
            } else if (distJesus < 40) {
                if (this.chapterState === 0) this.dialogueManager.start('jesus_wait');
                else if (this.chapterState === 1) this.dialogueManager.start('jesus_call');
            }
        }

        if (this.player.x > this.cameras.main.width - 5) {
            if (this.lessonHUD.getProgress() === this.lessonHUD.getMaxProgress()) {
                state.currentChapter = 8;
                gameStateManager.save();
                this.scene.start('ThomasDecisionScene');
            } else {
                this.player.x = this.cameras.main.width - 5;
            }
        }
    }
}
