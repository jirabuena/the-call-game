import * as Phaser from 'phaser';
import { state, gameStateManager } from '../state/GameState';
import { DialogueManager } from '../systems/DialogueManager';
import { JournalManager } from '../systems/JournalManager';
import { LessonHUD } from '../systems/LessonHUD';
import { GameOverUI } from '../systems/GameOverUI';
import { ChapterTitleManager } from '../systems/ChapterTitleManager';
import { DiscipleSelectUI } from '../systems/DiscipleSelectUI';
import { VirtualGamepad } from "../systems/VirtualGamepad";

export class SimonZealotScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: any;
    private dialogueManager!: DialogueManager;
    private journalManager!: JournalManager;
    private lessonHUD!: LessonHUD;
    private gameOverUI!: GameOverUI;
    private discipleUI!: DiscipleSelectUI;
    private virtualGamepad!: VirtualGamepad;
    private interactKey!: Phaser.Input.Keyboard.Key;
    private speed = 80;

    constructor() { super('SimonZealotScene'); }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const wallHeight = height * 0.4;
        
        this.add.rectangle(0, 0, width, wallHeight, 0x333333).setOrigin(0);
        this.add.rectangle(0, wallHeight, width, height - wallHeight, 0x666666).setOrigin(0);

        this.player = this.physics.add.sprite(40, height * 0.7, 'tex_sand');
        this.player.setTint(0x4CAF50);
        this.player.setCollideWorldBounds(true);
        this.player.body?.setSize(16, 16);

        this.physics.world.setBounds(0, wallHeight, width, height - wallHeight);

        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasd = this.input.keyboard.addKeys('W,A,S,D');
            this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
            const jKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
            jKey.on('down', () => this.journalManager.toggle());
        }

        this.dialogueManager = new DialogueManager(this);
        this.journalManager = new JournalManager(this);
        this.lessonHUD = new LessonHUD(this, 1);
        this.gameOverUI = new GameOverUI(this, this.journalManager);
        this.discipleUI = new DiscipleSelectUI(this);

        ChapterTitleManager.showTitle(this, 'SimonZealotScene', 'Em desenvolvimento');
        
        this.physics.world.setBoundsCollision(true, false, true, true);
        this.virtualGamepad = new VirtualGamepad(this);
    }

    update() {
        if (this.virtualGamepad && this.dialogueManager.isActive()) {
            this.dialogueManager.updateGamepadInput(this.virtualGamepad.actionJustDown, this.virtualGamepad.upJustDown, this.virtualGamepad.downJustDown);
            this.virtualGamepad.actionJustDown = false; // Prevent double-triggering interaction
        }

        if (this.dialogueManager.isActive() || (this.journalManager as any).isVisible) {
            this.player.setVelocity(0);
            return;
        }

        let vx = 0; let vy = 0;
        if (this.cursors.left.isDown || this.wasd.A.isDown || this.virtualGamepad?.left || this.virtualGamepad?.left) vx = -this.speed;
        if (this.cursors.right.isDown || this.wasd.D.isDown || this.virtualGamepad?.right || this.virtualGamepad?.right) vx = this.speed;
        if (this.cursors.up.isDown || this.wasd.W.isDown || this.virtualGamepad?.up || this.virtualGamepad?.up) vy = -this.speed;
        if (this.cursors.down.isDown || this.wasd.S.isDown || this.virtualGamepad?.down || this.virtualGamepad?.down) vy = this.speed;

        this.player.setVelocity(vx, vy);
        if (vx !== 0 || vy !== 0) this.player.y += Math.sin(this.time.now / 100) * 0.5;

        // Auto-complete lesson and move on for boilerplates
        if (this.player.x > this.cameras.main.width - 5) {
            this.scene.start('ThaddaeusScene');
        }
        if (this.virtualGamepad) this.virtualGamepad.update();
    }
}
