export class Player {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    speed: number;
    currentSpeed: number;
    constructor(x: number, y: number, width: number, height: number, color: string, speed: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.speed = speed;
        this.currentSpeed = 0;
    }

    draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.moveTo(this.x - this.width/2, this.y + this.height/3);
        context.lineTo(this.x, this.y - this.height/3 * 2);
        context.lineTo(this.x + this.width / 2, this.y + this.height/3);

        context.closePath();
        context.strokeStyle = this.color;
        context.stroke();
        context.fillStyle = this.color;
        context.fill();
    }

    update(deltaTime: number, context: CanvasRenderingContext2D) {
        let lastX = this.x;
        this.x += this.currentSpeed * deltaTime / 1000;
        if (this.x > context.canvas.width - this.width / 2 || this.x < this.width / 2) {
            this.x = lastX;
        }
    }

}