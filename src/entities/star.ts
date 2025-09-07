export class Star {
    x: number;
    y: number;
    radius1: number;
    radius2: number;
    blinkIntervalInMs: number;
    speedPerSecond: number;
    lastBlinkTimeInMs: number = 0;
    currentRadiusType = 0;
    lastUpdateTimeInMs = 0;

    constructor(x: number, y: number, radius1: number, radius2: number, speedPerSecond: number) {
        this.x = x;
        this.y = y;
        this.radius1 = radius1;
        this.radius2 = radius2;
        this.blinkIntervalInMs = 1000 + Date.now() % 3000;
        this.speedPerSecond = speedPerSecond;
    }

    drawStar(currentTimeInMs: number, context: CanvasRenderingContext2D) {
        let radius = 0;
        if (currentTimeInMs - this.lastBlinkTimeInMs > this.blinkIntervalInMs) {
            this.lastBlinkTimeInMs = currentTimeInMs;
            this.currentRadiusType++;
        }
        radius = this.currentRadiusType % 2 === 0 ? this.radius1 : this.radius2;
        context.beginPath();
        try {
            context.arc(this.x, this.y, radius, 0, Math.PI * 2, true);
            context.fillStyle = 'white';
            context.fill();
            context.beginPath();
            context.fillRect(this.x - radius * .75, this.y - radius * .75, radius * 1.5, radius * 1.5);
            context.beginPath();
            context.translate(this.x, this.y);
            context.rotate(Math.PI / 4);
            context.fillRect(-radius * 0.75, -radius * 0.75, radius * 1.5, radius * 1.5);
        } finally {
            context.resetTransform();
        }
    }

    update(deltaTimeInMs: number) {
        let deltaY = deltaTimeInMs / 1000 * this.speedPerSecond;
        this.y += deltaY;
    }

}