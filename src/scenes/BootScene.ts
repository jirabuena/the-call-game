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
        this.scene.start('MainMenuScene');
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

        // 6. Net Texture (Grid pattern)
        g.fillStyle(0x000000, 0); // transparent bg
        g.fillRect(0, 0, 32, 32);
        g.fillStyle(0xb5a687); // hemp color
        for (let i = 0; i < 32; i += 4) {
            g.fillRect(i, 0, 1, 32);
            g.fillRect(0, i, 32, 1);
        }
        g.generateTexture('tex_net', 32, 32);
        g.clear();

        // 7. Basket Texture (Wicker pattern)
        g.fillStyle(0xd2b48c); // Light brown base
        g.fillRect(0, 0, 16, 16);
        g.fillStyle(0x8B5A2B); // Darker brown weave
        for (let i = 0; i < 16; i += 4) {
            g.fillRect(0, i, 16, 2);
            g.fillRect(i, 0, 2, 16);
        }
        g.generateTexture('tex_basket', 16, 16);
        g.clear();

        // 8. Campfire Texture (Logs and Ash)
        g.fillStyle(0x000000, 0); // transparent bg
        g.fillRect(0, 0, 16, 16);
        g.fillStyle(0x3e2723); // Log 1
        g.fillRect(2, 6, 12, 4);
        g.fillStyle(0x4e342e); // Log 2
        g.fillRect(6, 2, 4, 12);
        g.fillStyle(0x555555); // Ash
        g.fillRect(4, 4, 8, 8);
        g.fillStyle(0x7f0000); // Embers
        g.fillRect(7, 7, 2, 2);
        g.generateTexture('tex_campfire', 16, 16);
        g.clear();

        // Helper to draw a character base
        const drawChar = (bodyColor: number, skinColor: number, hairColor: number, hasBeard: boolean, hasBelt: boolean = true) => {
            g.clear();
            // Body
            g.fillStyle(bodyColor);
            g.fillRect(0, 0, 16, 24);
            g.fillStyle(0x000000);
            g.strokeRect(0, 0, 16, 24);
            
            // Belt
            if (hasBelt) {
                g.fillStyle(0x5C4033);
                g.fillRect(1, 14, 14, 2);
            }

            // Face area
            g.fillStyle(skinColor);
            g.fillRect(3, 3, 10, 8);
            
            // Hair
            g.fillStyle(hairColor);
            g.fillRect(2, 2, 12, 3); // top hair
            g.fillRect(2, 5, 2, 4);  // side hair L
            g.fillRect(12, 5, 2, 4); // side hair R
            
            // Eyes
            g.fillStyle(0x000000);
            g.fillRect(5, 6, 2, 2);
            g.fillRect(9, 6, 2, 2);

            // Beard
            if (hasBeard) {
                g.fillStyle(hairColor);
                g.fillRect(3, 9, 10, 3);
                g.fillRect(5, 12, 6, 2);
            }
        };

        // Jesus Texture (White tunic, brown hair/beard, red sash)
        drawChar(0xffffff, 0xffdcb1, 0x6b4226, true, false);
        g.fillStyle(0xaa3333); // Red sash
        g.fillRect(0, 4, 4, 12);
        g.fillRect(4, 12, 12, 4);
        g.generateTexture('tex_jesus', 16, 24);

        // Peter Texture (Blue tunic, dark grey hair/beard)
        drawChar(0x4a90e2, 0xe0c090, 0x444444, true);
        g.generateTexture('tex_peter', 16, 24);

        // Matthew Texture (Dark Red tunic, black hair/neat beard)
        drawChar(0x8B0000, 0xffdcb1, 0x111111, true);
        // Add a small scroll or coin pouch detail
        g.fillStyle(0xffd700); // Gold pouch
        g.fillRect(11, 15, 3, 3);
        g.generateTexture('tex_matthew', 16, 24);

        // Roman Guard Texture (Red tunic, iron armor)
        drawChar(0xaa2222, 0xffccaa, 0x332211, false, false);
        g.fillStyle(0x888888); // Iron breastplate
        g.fillRect(2, 8, 12, 8);
        g.fillStyle(0xcccc00); // Brass trim
        g.fillRect(2, 14, 12, 2);
        g.fillStyle(0x999999); // Helmet
        g.fillRect(2, 1, 12, 4);
        g.fillRect(6, 0, 4, 1);
        g.generateTexture('tex_guard', 16, 24);

        // Pilgrim Texture (Brown tunic, simple hood/hair)
        drawChar(0x8B7355, 0xd0a070, 0x553311, true);
        g.generateTexture("tex_andrew", 16, 24);
        drawChar(0x8B4513, 0xd0a070, 0x333333, true);
        g.generateTexture("tex_john_baptist", 16, 24);
        drawChar(0x800080, 0xffdcb1, 0x999999, true);
        g.generateTexture("tex_scribe", 16, 24);
        drawChar(0x8B0000, 0xd0a070, 0x444444, true);
        g.generateTexture("tex_james", 16, 24);
        drawChar(0x006400, 0xd0a070, 0x444444, false);
        g.generateTexture("tex_john", 16, 24);
        drawChar(0x555555, 0xe0c090, 0xcccccc, true);
        g.generateTexture("tex_zebedee", 16, 24);
        drawChar(0x8b7355, 0xaa7755, 0x333333, true, false);
        g.generateTexture("tex_worker", 16, 24);
        g.clear();
        g.fillStyle(0xDEB887);
        g.fillCircle(8, 8, 8);
        g.fillStyle(0x8B5A2B);
        g.strokeCircle(8, 8, 8);
        for(let i=2; i<8; i+=2) g.strokeCircle(8, 8, i);
        g.generateTexture("tex_rope", 16, 16);
        g.clear();
        drawChar(0x8B7355, 0xd0a070, 0x553311, true);
        g.generateTexture("tex_pilgrim", 16, 24);
        g.clear();
    }
}
