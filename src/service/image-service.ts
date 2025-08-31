export class ImageService {
    private static instance: ImageService;
    private images: Map<string, HTMLImageElement>;

    private constructor() {
        this.images = new Map<string, HTMLImageElement>();
    }
    public static getInstance(): ImageService {
        if (!ImageService.instance) {
            ImageService.instance = new ImageService();
        }
        return ImageService.instance;
    }

    public loadImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            if (this.images.has(src)) {
                resolve(this.images.get(src)!);
                return;
            }

            const img = new Image();
            img.onload = () => {
                this.images.set(src, img);
                resolve(img);
            };
            img.onerror = reject;
            img.src = src;
        });
    }

    public async getImage(src: string): Promise<HTMLImageElement | undefined> {
        if (!this.images.has(src)) {
            await this.loadImage(src);
        }
        return this.images.get(src);
    }
}