import Phaser from 'phaser';

export default class PathDrawer {
    constructor(scene) {
        this.scene = scene;
        this.isDrawing = false;
        this.currentPath = [];
        this.pathGraphics = scene.add.graphics();
        this.pathGraphics.setDepth(50);

        // Set up input handlers
        this.setupInputHandlers();

        console.log('Path Drawer initialized');
    }

    setupInputHandlers() {
        const scene = this.scene;

        // Start drawing on pointer down
        scene.input.on('pointerdown', (pointer) => {
            this.isDrawing = true;
            this.currentPath = [];
            this.currentPath.push({ x: pointer.x, y: pointer.y });
            this.pathGraphics.clear();
        });

        // Continue drawing on pointer move
        scene.input.on('pointermove', (pointer) => {
            if (this.isDrawing) {
                this.currentPath.push({ x: pointer.x, y: pointer.y });
                this.drawPath();
            }
        });

        // Finish drawing on pointer up
        scene.input.on('pointerup', () => {
            if (this.isDrawing && this.currentPath.length > 1) {
                this.finalizePath();
            }
            this.isDrawing = false;
        });
    }

    drawPath() {
        if (this.currentPath.length < 2) return;

        this.pathGraphics.clear();
        this.pathGraphics.lineStyle(3, 0x00ff00, 0.8);

        this.pathGraphics.beginPath();
        this.pathGraphics.moveTo(this.currentPath[0].x, this.currentPath[0].y);

        for (let i = 1; i < this.currentPath.length; i++) {
            this.pathGraphics.lineTo(this.currentPath[i].x, this.currentPath[i].y);
        }

        this.pathGraphics.strokePath();

        // Draw dots along the path
        this.currentPath.forEach((point, index) => {
            if (index % 5 === 0) {
                this.pathGraphics.fillStyle(0x00ff00, 0.6);
                this.pathGraphics.fillCircle(point.x, point.y, 2);
            }
        });
    }

    finalizePath() {
        // Simplify path by sampling every nth point
        const simplifiedPath = [];
        const sampleRate = 10;

        for (let i = 0; i < this.currentPath.length; i += sampleRate) {
            simplifiedPath.push(this.currentPath[i]);
        }

        // Always include the last point
        if (simplifiedPath[simplifiedPath.length - 1] !== this.currentPath[this.currentPath.length - 1]) {
            simplifiedPath.push(this.currentPath[this.currentPath.length - 1]);
        }

        // Assign path to nearest insect
        this.assignPathToNearestInsect(simplifiedPath);

        // Clear the path graphics after a short delay
        this.scene.time.delayedCall(500, () => {
            this.pathGraphics.clear();
        });

        console.log('Path finalized with', simplifiedPath.length, 'points');
    }

    assignPathToNearestInsect(path) {
        if (path.length === 0) return;

        const startPoint = path[0];
        const insects = this.scene.insects;

        if (!insects || insects.length === 0) return;

        // Find the nearest insect to the start of the path
        let nearestInsect = insects[0];
        let minDistance = Phaser.Math.Distance.Between(
            startPoint.x, startPoint.y,
            nearestInsect.x, nearestInsect.y
        );

        insects.forEach(insect => {
            const distance = Phaser.Math.Distance.Between(
                startPoint.x, startPoint.y,
                insect.x, insect.y
            );
            if (distance < minDistance) {
                minDistance = distance;
                nearestInsect = insect;
            }
        });

        // Assign the path to the nearest insect
        nearestInsect.setPath(path);
    }

    update() {
        // Update logic if needed
    }

    destroy() {
        if (this.pathGraphics) {
            this.pathGraphics.destroy();
        }
    }
}
