import { ImageService } from "../service/image-service";

export class Alien {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    speed: number;
    image: HTMLImageElement;

    constructor(x: number, y: number, width: number, height: number, color: string, speed: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.speed = speed;
        this.image = new Image();
    }

    draw(context: CanvasRenderingContext2D) {
        ImageService.getInstance().getImage(import.meta.env.BASE_URL + 'assets/images/alien1.jpg').then((img) => {
            if (img) {
                context.drawImage(img, this.x, this.y, this.width, this.height);
            }
        });
    }

    update(deltaTime: number) {
        this.y += this.speed * deltaTime / 1000;
    }
}