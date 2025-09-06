export class SoundService {
    private static instance: SoundService
    private soundToAudioBufferMap: Map<string, AudioBuffer>;
    private audioContext: AudioContext;

    private constructor(audioContext: AudioContext) {
        this.audioContext = audioContext;
        this.soundToAudioBufferMap = new Map<string, AudioBuffer>();
    }

    public static getInstance(audioContext: AudioContext): SoundService {
        if (!SoundService.instance) {
            SoundService.instance = new SoundService(audioContext);
        }
        return SoundService.instance;
    }

    public loadSoundPool(src: string): Promise<AudioBuffer> {
        return new Promise((resolve, reject) => {
            if (!this.soundToAudioBufferMap.has(src)) {
                fetch(src)
                    .then(response => response.arrayBuffer())
                    .then(arrayBuffer => {
                        this.audioContext.decodeAudioData(arrayBuffer).then(audioBuffer => {
                            this.soundToAudioBufferMap.set(src, audioBuffer);
                            resolve(audioBuffer)
                        });

                    }).catch(reject);
            } else {
                resolve(this.soundToAudioBufferMap.get(src)!);
            }
        });
    }

    public async getAudioBufferSource(src: string): Promise<AudioBufferSourceNode| undefined> {
        const audioBuffer = await this.loadSoundPool(src);
        const audioBufferSource = this.audioContext.createBufferSource();
        audioBufferSource.buffer = audioBuffer;
        audioBufferSource.connect(this.audioContext.destination);
        return audioBufferSource;
    }
}