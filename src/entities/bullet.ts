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
        context.fillStyle = this.color;
        context.arc(this.x, this.y, this.length / 2, 0, Math.PI * 2);
        context.fill();
        context.closePath();
    }

    update(deltaTime: number) {
        this.y += this.vy  * deltaTime / 1000;;
    }
}