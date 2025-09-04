export class SoundService {
    private static instance: SoundService
    private objectUrl: Map<string, string>;

    private constructor() {
        this.objectUrl = new Map<string, string>();
    }

    public static getInstance(): SoundService {
        if (!SoundService.instance) {
            SoundService.instance = new SoundService();
        }
        return SoundService.instance;
    }
    public loadSoundObjectUrl(src: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.objectUrl.has(src)) {
                fetch(src)
                    .then(response => response.blob())
                    .then(blob => { 
                        const url = URL.createObjectURL(blob);
                        this.objectUrl.set(src, url);
                        resolve(url);
                    })
                    .catch(reject);
                return;
            } else {
                resolve(this.objectUrl.get(src)!);
            }
        });
    }

    public async getSound(src: string): Promise<HTMLAudioElement | undefined> {
        const objectUrl = await this.loadSoundObjectUrl(src);
        const audio = new Audio();
        audio.src = objectUrl;
        audio.load();
        return audio;
    }
}