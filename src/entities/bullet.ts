export class Bullet {
    x: number;
    y: number;
    vx: number;
    vy: number;
    length: number;
    color: string;

    constructor(x: number, y: number, vx: number, vy: number, length: number, color: string) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.length = length;
        this.color = color;
    }

    draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(this.x, this.y - this.length);
        context.strokeStyle = this.color;
        context.lineWidth = 5;
        context.stroke();
    }

    update(deltaTime: number) {
        this.y += this.vy  * deltaTime / 1000;;
    }
}