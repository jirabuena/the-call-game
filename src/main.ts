import * as Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { WorldScene } from './scenes/WorldScene';
import { SeaOfGalileeScene } from './scenes/SeaOfGalileeScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 384,
    height: 216,
    parent: document.body,
    pixelArt: true,
    roundPixels: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0, x: 0 },
            debug: false
        }
    },
    scene: [BootScene, SeaOfGalileeScene, WorldScene]
};

new Phaser.Game(config);
