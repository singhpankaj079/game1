import { ImageService } from "../service/image-service";

export class Explosion {
    x: number;
    y: number
    width: number;
    height: number;
    displayEndTime: number;
    shouldDisplay: boolean = true;
    
    constructor(x: number, y: number, width: number, height: number, displayEndTime: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.displayEndTime = displayEndTime;
    }

    draw(context: CanvasRenderingContext2D) {
        if (!this.shouldDisplay) {
            return;
        }
        ImageService.getInstance().getImage(import.meta.env.BASE_URL + 'assets/images/explosion.jpg').then((img) => {
                    if (img) {
                        context.drawImage(img, this.x, this.y, this.width, this.height);
                    }
                });
    }

    update(timeSinceGameStart: number) {
        if (timeSinceGameStart >= this.displayEndTime) {
            this.shouldDisplay = false;
        }
    }
}