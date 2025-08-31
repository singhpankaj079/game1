export class SoundService {
    private static instance: SoundService
    private sounds: Map<string, HTMLAudioElement>;

    private constructor() {
        this.sounds = new Map<string, HTMLAudioElement>();
    }

    public static getInstance(): SoundService {
        if (!SoundService.instance) {
            SoundService.instance = new SoundService();
        }
        return SoundService.instance;
    }
    public loadSound(src: string): Promise<HTMLAudioElement> {
        return new Promise((resolve, reject) => {
            if (this.sounds.has(src)) {
                resolve(this.sounds.get(src)!);
                return;
            }
            const audio = new Audio();
            audio.onloadeddata = () => {
                this.sounds.set(src, audio);
                resolve(audio);
            };
            audio.onerror = reject;
            audio.src = src;
            audio.load();
        });
    }

    public async getSound(src: string): Promise<HTMLAudioElement | undefined> {
        if (!this.sounds.has(src)) {
            await this.loadSound(src);
        }
        return this.sounds.get(src);
    }
}