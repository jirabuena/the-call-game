import * as Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // We will generate procedural textures here
    }

    create() {
        this.generateTextures();
        this.scene.start('CapernaumScene');
    }

    private generateTextures() {
        const g = this.make.graphics({ x: 0, y: 0 });

        // 1. Sand Texture (Tileable)
        g.fillStyle(0xd2b48c);
        g.fillRect(0, 0, 32, 32);
        for(let i=0; i<30; i++) {
            g.fillStyle(Math.random() > 0.5 ? 0xc2a47c : 0xe2c49c, 1);
            g.fillRect(Math.floor(Math.random() * 32), Math.floor(Math.random() * 32), 1, 1);
        }
        g.generateTexture('tex_sand', 32, 32);
        g.clear();

        // 2. Cobblestone Texture (Tileable)
        g.fillStyle(0x7a7a7a);
        g.fillRect(0, 0, 32, 32);
        g.fillStyle(0x5a5a5a);
        g.fillRect(0, 0, 16, 16);
        g.fillRect(16, 16, 16, 16);
        g.fillStyle(0x8a8a8a);
        g.fillRect(1, 1, 14, 14);
        g.fillRect(17, 17, 14, 14);
        g.generateTexture('tex_cobble', 32, 32);
        g.clear();

        // 3. Water Texture (Tileable)
        g.fillStyle(0x3a7ca5);
        g.fillRect(0, 0, 32, 32);
        g.fillStyle(0x4a8cb5);
        g.fillRect(0, 10, 32, 2);
        g.fillRect(0, 26, 32, 2);
        g.fillStyle(0x2a6c95);
        g.fillRect(0, 12, 32, 1);
        g.fillRect(0, 28, 32, 1);
        g.generateTexture('tex_water', 32, 32);
        g.clear();

        // 4. Wood Texture
        g.fillStyle(0x6b4226);
        g.fillRect(0, 0, 32, 32);
        g.fillStyle(0x5b3216);
        for(let i=0; i<32; i+=4) {
            g.fillRect(0, i, 32, 1);
        }
        g.generateTexture('tex_wood', 32, 32);
        g.clear();

        // 5. Stone Wall Texture
        g.fillStyle(0x8b8989);
        g.fillRect(0, 0, 32, 32);
        g.fillStyle(0x555555);
        g.fillRect(0, 15, 32, 2); // horizontal line
        g.fillRect(15, 0, 2, 15); // vertical line 1
        g.fillRect(31, 15, 2, 17); // vertical line 2
        g.generateTexture('tex_stone_wall', 32, 32);
        g.clear();

        // 6. Base Character Texture (White body, we'll tint it)
        g.fillStyle(0xffffff); // Body outline/base
        g.fillRect(0, 0, 16, 24);
        g.fillStyle(0x000000); // Outline
        g.strokeRect(0, 0, 16, 24);
        g.fillStyle(0xffdcb1); // Face area
        g.fillRect(3, 2, 10, 8);
        g.fillStyle(0x000000); // Eyes
        g.fillRect(5, 5, 2, 2);
        g.fillRect(9, 5, 2, 2);
        g.generateTexture('tex_char', 16, 24);
        g.clear();
    }
}
