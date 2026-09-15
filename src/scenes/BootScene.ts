import * as Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load assets here if necessary
    }

    create() {
        this.scene.start('CapernaumScene');
    }
}
