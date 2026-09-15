import * as Phaser from 'phaser';
import { state, gameStateManager } from '../state/GameState';
import { DialogueManager, type DialogueTree } from '../systems/DialogueManager';
import { JournalManager } from '../systems/JournalManager';
import { LessonHUD } from '../systems/LessonHUD';
import { GameOverUI } from '../systems/GameOverUI';
import { ChapterTitleManager } from '../systems/ChapterTitleManager';
import { DiscipleSelectUI } from '../systems/DiscipleSelectUI';
import { VirtualGamepad } from "../systems/VirtualGamepad";

const zebedeeData_pt: DialogueTree = {
    'zebedee_busy': {
        id: 'zebedee_busy', speakerId: 'zebedee', avatar: '0xcccccc',
        text: 'Zebedeu: Tiago, ande logo com essas cordas. A barca não vai se consertar sozinha!',
        choices: [{ text: '...', nextNodeId: 'end', actionTrigger: 'talked_zebedee' }]
    },
    'rope_inspect': {
        id: 'rope_inspect', speakerId: 'system', avatar: '0x000000',
        text: 'Rolos de corda grossa. O negócio de sua família é próspero, mas exige trabalho duro.',
        choices: [{ text: '...', nextNodeId: 'end', actionTrigger: 'inspect_rope' }]
    },
    'worker_chat': {
        id: 'worker_chat', speakerId: 'worker', avatar: '0x8b7355',
        text: 'Empregado: Seu pai está de mau humor hoje. É melhor não o contrariar.',
        choices: [{ text: '...', nextNodeId: 'end' }]
    },
    'jesus_call': {
        id: 'jesus_call', speakerId: 'jesus', avatar: '0xFFFFFF',
        text: 'Jesus caminha pela margem, olha para você e para João e diz: "Segui-me".',
        choices: [
            { text: 'Deixar as redes e o barco de meu pai para segui-Lo.', nextNodeId: 'jesus_accept' },
            { text: 'Ficarei até herdar o negócio de meu pai.', nextNodeId: 'jesus_reject' }
        ]
    },
    'jesus_accept': {
        id: 'jesus_accept', speakerId: 'system', avatar: '0x000000',
        text: 'Imediatamente, você e seu irmão João deixaram o barco e seu pai Zebedeu com os empregados, e O seguiram.',
        choices: [{ text: '[Continuar]', nextNodeId: 'end', actionTrigger: 'unlock_james' }]
    },
    'jesus_reject': {
        id: 'jesus_reject', speakerId: 'system', avatar: '0x000000',
        text: 'O custo do discipulado exige deixar o conforto. Você escolheu a segurança do mundo.',
        choices: [{ text: '[Fim da Jornada]', nextNodeId: 'end', actionTrigger: 'trigger_game_over' }]
    }
};

const zebedeeData_es: DialogueTree = {
    'zebedee_busy': {
        id: 'zebedee_busy', speakerId: 'zebedee', avatar: '0xcccccc',
        text: 'Zebedeo: Santiago, apúrate con esas cuerdas. ¡La barca no se arreglará sola!',
        choices: [{ text: '...', nextNodeId: 'end', actionTrigger: 'talked_zebedee' }]
    },
    'rope_inspect': {
        id: 'rope_inspect', speakerId: 'system', avatar: '0x000000',
        text: 'Rollos de cuerda gruesa. El negocio de tu familia es próspero, pero exige trabajo duro.',
        choices: [{ text: '...', nextNodeId: 'end', actionTrigger: 'inspect_rope' }]
    },
    'worker_chat': {
        id: 'worker_chat', speakerId: 'worker', avatar: '0x8b7355',
        text: 'Empleado: Tu padre está de mal humor hoy. Mejor no llevarle la contraria.',
        choices: [{ text: '...', nextNodeId: 'end' }]
    },
    'jesus_call': {
        id: 'jesus_call', speakerId: 'jesus', avatar: '0xFFFFFF',
        text: 'Jesús camina por la orilla, te mira a ti y a Juan y dice: "Síganme".',
        choices: [
            { text: 'Dejar las redes y la barca de mi padre para seguirle.', nextNodeId: 'jesus_accept' },
            { text: 'Me quedaré hasta heredar el negocio de mi padre.', nextNodeId: 'jesus_reject' }
        ]
    },
    'jesus_accept': {
        id: 'jesus_accept', speakerId: 'system', avatar: '0x000000',
        text: 'Inmediatamente, tú y tu hermano Juan dejaron la barca y a su padre Zebedeo con los jornaleros, y le siguieron.',
        choices: [{ text: '[Continuar]', nextNodeId: 'end', actionTrigger: 'unlock_james' }]
    },
    'jesus_reject': {
        id: 'jesus_reject', speakerId: 'system', avatar: '0x000000',
        text: 'El costo del discipulado exige dejar la comodidad. Elegiste la seguridad del mundo.',
        choices: [{ text: '[Fin del Camino]', nextNodeId: 'end', actionTrigger: 'trigger_game_over' }]
    }
};

export class ZebedeeBoatScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private johnNPC!: Phaser.Physics.Arcade.Sprite;
    private zebedeeNPC!: Phaser.Physics.Arcade.Sprite;
    private workerNPC!: Phaser.Physics.Arcade.Sprite;
    private jesusNPC!: Phaser.Physics.Arcade.Sprite;
    
    private rope1!: Phaser.GameObjects.Sprite;
    private rope2!: Phaser.GameObjects.Sprite;

    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasdKeys!: any;
    private interactKey!: Phaser.Input.Keyboard.Key;
    
    private dialogueManager!: DialogueManager;
    private journalManager!: JournalManager;
    private lessonHUD!: LessonHUD;
    private gameOverUI!: GameOverUI;
    private _discipleUI!: DiscipleSelectUI;
    private virtualGamepad!: VirtualGamepad;

    private speed = 80;
    private isDialogueActive: boolean = false;
    private treeData!: DialogueTree;
    private activeTree: DialogueTree | null = null;
    
    private waterBoundaryY!: number;

    // Progression
    private talkedZebedee = false;
    private inspectedRope = false;
    private JesusArrived = false;
    private JamesUnlocked = false;

    constructor() { super('ZebedeeBoatScene'); }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.waterBoundaryY = height * 0.4;
        
        // Background (Water / Sand)
        this.add.tileSprite(0, 0, width, this.waterBoundaryY, 'tex_water').setOrigin(0);
        this.add.rectangle(0, this.waterBoundaryY, width, 4, 0x285073).setOrigin(0);
        this.add.tileSprite(0, this.waterBoundaryY, width, height - this.waterBoundaryY, 'tex_sand').setOrigin(0);

        // Environment Props (Two Boats)
        this.add.rectangle(80, this.waterBoundaryY - 10, 80, 24, 0x522C1A); // Boat 1
        this.add.rectangle(80, this.waterBoundaryY - 25, 4, 40, 0x422216); // Mast 1
        this.add.rectangle(240, this.waterBoundaryY - 5, 90, 20, 0x6b4226); // Boat 2

        this.rope1 = this.add.sprite(90, height * 0.8, 'tex_rope');
        this.rope2 = this.add.sprite(110, height * 0.85, 'tex_rope');

        // Characters
        // James (Player)
        this.player = this.physics.add.sprite(40, height * 0.7, 'tex_james');
        this.player.setCollideWorldBounds(true);
        this.player.body?.setSize(16, 16);

        // John
        this.johnNPC = this.physics.add.sprite(55, height * 0.7, 'tex_john');
        this.johnNPC.setImmovable(true);
        // Follow James visually a bit for now
        this.events.on('update', () => {
             if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.johnNPC.x, this.johnNPC.y) > 30) {
                 this.physics.moveToObject(this.johnNPC, this.player, this.speed * 0.8);
                 if (this.johnNPC.body && this.johnNPC.body.velocity.x !== 0) {
                     this.johnNPC.setAngle(Math.sin(this.time.now / 100) * 10);
                 }
             } else {
                 if (this.johnNPC.body) this.johnNPC.body.velocity.setTo(0, 0);
                 this.johnNPC.setAngle(0);
             }
        });

        // Zebedee
        this.zebedeeNPC = this.physics.add.sprite(90, height * 0.5, 'tex_zebedee');
        this.zebedeeNPC.setImmovable(true);

        // Worker
        this.workerNPC = this.physics.add.sprite(220, height * 0.55, 'tex_worker');
        this.workerNPC.setImmovable(true);

        // Jesus (Hidden initially)
        this.jesusNPC = this.physics.add.sprite(-20, height * 0.6, 'tex_jesus');
        this.jesusNPC.setImmovable(true);
        this.jesusNPC.setVisible(false);

        this.physics.world.setBounds(0, this.waterBoundaryY, width, height - this.waterBoundaryY);
        this.physics.world.setBoundsCollision(true, false, true, true);
        this.virtualGamepad = new VirtualGamepad(this);

        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasdKeys = this.input.keyboard.addKeys('W,A,S,D');
            this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J).on('down', () => this.journalManager.toggle());
        }

        const title = state.language === 'pt' ? 'Capítulo 3\nRemendando as Redes' : 'Capítulo 3\nRemendando las Redes';
        const subtitle = state.language === 'pt' ? 'O chamado de Tiago e João' : 'El llamado de Santiago y Juan';
        ChapterTitleManager.showTitle(this, title, subtitle);

        this.treeData = state.language === 'pt' ? zebedeeData_pt : zebedeeData_es;

        this.dialogueManager = new DialogueManager(this);
        this.journalManager = new JournalManager(this);
        this.lessonHUD = new LessonHUD(this, 3); // Rope, Zebedee, Jesus
        this.gameOverUI = new GameOverUI(this, this.journalManager);
        this._discipleUI = new DiscipleSelectUI(this);

        this.dialogueManager.setOnChoiceSelect((nextNodeId, actionTrigger) => {
            if (actionTrigger) this.handleNarrativeAction(actionTrigger);
            
            if (nextNodeId && nextNodeId !== 'end' && this.activeTree && this.activeTree[nextNodeId]) {
                this.dialogueManager.showNode(this.activeTree[nextNodeId]);
            } else {
                this.dialogueManager.hide();
                this.isDialogueActive = false;
                this.activeTree = null;
            }
        });
    }

    private handleNarrativeAction(action: string) {
        if (action === 'inspect_rope' && !this.inspectedRope) {
            this.inspectedRope = true;
            this.lessonHUD.advanceProgress();
            this.checkJesusArrival();
        } else if (action === 'talked_zebedee' && !this.talkedZebedee) {
            this.talkedZebedee = true;
            this.lessonHUD.advanceProgress();
            this.checkJesusArrival();
        } else if (action === 'unlock_james' && !this.JamesUnlocked) {
            this.JamesUnlocked = true;
            this.lessonHUD.advanceProgress();
            
            if (!state.unlockedDisciples.includes('james')) {
                state.unlockedDisciples.push('james');
                state.unlockedPassages.push('mark_1_19'); // Assuming context
                gameStateManager.save();
            }
            // Jesus leaves
            if (this.jesusNPC.body) this.jesusNPC.setVelocityX(40);
        } else if (action === 'trigger_game_over') {
            this.dialogueManager.hide();
            this.gameOverUI.show();
        }
    }

    private checkJesusArrival() {
        if (this.talkedZebedee && this.inspectedRope && !this.JesusArrived) {
            this.JesusArrived = true;
            this.jesusNPC.setVisible(true);
            this.jesusNPC.x = -20;
            if (this.jesusNPC.body) this.jesusNPC.setVelocityX(40);
            
            this.time.delayedCall(2000, () => {
                if (this.jesusNPC.body) {
                    this.jesusNPC.setVelocityX(0);
                    this.jesusNPC.setAngle(0);
                }
            });
        }
    }

    update() {
        if (this.virtualGamepad) this.virtualGamepad.update();
        if (!this.player || !this.player.body) return;
        this.player.setVelocity(0);

        if (Phaser.Input.Keyboard.JustDown(this.interactKey) || this.virtualGamepad?.actionJustDown || this.virtualGamepad?.actionJustDown && !this.isDialogueActive) {
            const pX = this.player.x; const pY = this.player.y;

            if (Phaser.Math.Distance.Between(pX, pY, this.rope1.x, this.rope1.y) < 40) {
                this.isDialogueActive = true;
                this.activeTree = this.treeData;
                this.dialogueManager.showNode(this.activeTree['rope_inspect']);
                return;
            }

            if (Phaser.Math.Distance.Between(pX, pY, this.zebedeeNPC.x, this.zebedeeNPC.y) < 40) {
                this.isDialogueActive = true;
                this.activeTree = this.treeData;
                this.dialogueManager.showNode(this.activeTree['zebedee_busy']);
                return;
            }

            if (Phaser.Math.Distance.Between(pX, pY, this.workerNPC.x, this.workerNPC.y) < 40) {
                this.isDialogueActive = true;
                this.activeTree = this.treeData;
                this.dialogueManager.showNode(this.activeTree['worker_chat']);
                return;
            }

            if (this.jesusNPC.visible && Phaser.Math.Distance.Between(pX, pY, this.jesusNPC.x, this.jesusNPC.y) < 40) {
                this.isDialogueActive = true;
                this.activeTree = this.treeData;
                this.dialogueManager.showNode(this.activeTree['jesus_call']);
                return;
            }
        }

        if (this.isDialogueActive || (this.journalManager as any).isVisible) return;

        let vx = 0; let vy = 0;
        if (this.cursors.left.isDown || this.wasdKeys.A.isDown || this.virtualGamepad?.left || this.virtualGamepad?.left) vx = -this.speed;
        if (this.cursors.right.isDown || this.wasdKeys.D.isDown || this.virtualGamepad?.right || this.virtualGamepad?.right) vx = this.speed;
        if (this.cursors.up.isDown || this.wasdKeys.W.isDown || this.virtualGamepad?.up || this.virtualGamepad?.up) vy = -this.speed;
        if (this.cursors.down.isDown || this.wasdKeys.S.isDown || this.virtualGamepad?.down || this.virtualGamepad?.down) vy = this.speed;

        if (vx !== 0 && vy !== 0) {
            const length = Math.sqrt(vx * vx + vy * vy);
            vx = (vx / length) * this.speed;
            vy = (vy / length) * this.speed;
        }

        if (this.player.y + (vy / 60) < this.waterBoundaryY + 12) {
            vy = Math.max(0, vy); 
            this.player.y = this.waterBoundaryY + 12;
        }

        this.player.setVelocity(vx, vy);
        if (vx !== 0 || vy !== 0) this.player.setAngle(Math.sin(this.time.now / 100) * 10);
        else this.player.setAngle(0);

        if (this.jesusNPC.body && this.jesusNPC.body.velocity.x > 0) {
            this.jesusNPC.setAngle(Math.sin(this.time.now / 100) * 10);
            if (this.JamesUnlocked && this.jesusNPC.x > this.cameras.main.width + 20) {
                this.jesusNPC.destroy();
            }
        }

        if (this.player.x > this.cameras.main.width - 5) {
            if (this.JamesUnlocked) {
                state.activeCharacter = 'james';
                state.currentChapter = 4;
                if (4 > state.unlockedChapter) state.unlockedChapter = 4;
                if (4 > state.unlockedChapter) state.unlockedChapter = 4;
                gameStateManager.save();
                this.scene.start('JohnCallingScene');
            } else {
                this.player.x = this.cameras.main.width - 5;
            }
        }
    }
}
