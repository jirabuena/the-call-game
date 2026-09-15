import * as Phaser from 'phaser';

export class ChapterTitleManager {
    public static showTitle(scene: Phaser.Scene, title: string, subtitle: string) {
        const width = scene.cameras.main.width;
        const height = scene.cameras.main.height;

        const bg = scene.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0).setDepth(1000);
        
        const titleText = scene.add.text(width / 2, height / 2 - 20, title, {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setDepth(1001);

        const subtitleText = scene.add.text(width / 2, height / 2 + 10, subtitle, {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#aaaaaa',
            align: 'center'
        }).setOrigin(0.5).setDepth(1001);

        // Fade out
        scene.tweens.add({
            targets: [bg, titleText, subtitleText],
            alpha: 0,
            delay: 2500,
            duration: 1500,
            onComplete: () => {
                bg.destroy();
                titleText.destroy();
                subtitleText.destroy();
            }
        });
    }
}
