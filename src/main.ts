import { ChapterSelectScene } from "./scenes/ChapterSelectScene";
import * as Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { JordanRiverScene } from './scenes/JordanRiverScene';
import { SeaOfGalileeScene } from './scenes/SeaOfGalileeScene';
import { ZebedeeBoatScene } from './scenes/ZebedeeBoatScene';
import { JohnCallingScene } from './scenes/JohnCallingScene';
import { BethsaidaScene } from './scenes/BethsaidaScene';
import { UnderFigTreeScene } from './scenes/UnderFigTreeScene';
import { CapernaumTaxScene } from './scenes/CapernaumTaxScene';
import { ThomasDecisionScene } from './scenes/ThomasDecisionScene';
import { JamesAlphaeusScene } from './scenes/JamesAlphaeusScene';
import { SimonZealotScene } from './scenes/SimonZealotScene';
import { ThaddaeusScene } from './scenes/ThaddaeusScene';
import { JudasIscariotScene } from './scenes/JudasIscariotScene';
import { JerusalemGatesScene } from './scenes/JerusalemGatesScene';

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
    scene: [
        ChapterSelectScene,
        
        
        
        
        BootScene, 
        MainMenuScene, 
        JordanRiverScene,     // Cap 1: Andrew
        SeaOfGalileeScene,    // Cap 2: Peter
        ZebedeeBoatScene,     // Cap 3: James
        JohnCallingScene,     // Cap 4: John
        BethsaidaScene,       // Cap 5: Philip
        UnderFigTreeScene,    // Cap 6: Bartholomew (Nathanael)
        CapernaumTaxScene,    // Cap 7: Matthew
        ThomasDecisionScene,  // Cap 8: Thomas
        JamesAlphaeusScene,   // Cap 9: James (Alphaeus)
        SimonZealotScene,     // Cap 10: Simon Zealot
        ThaddaeusScene,       // Cap 11: Judas Thaddaeus
        JudasIscariotScene,   // Cap 12: Judas Iscariot
        JerusalemGatesScene
    ]
};

new Phaser.Game(config);
