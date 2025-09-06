export class SoundPool {
    private poolSize: number = 20;
    private audioContext: AudioContext;
    private audioBuffer: AudioBuffer;
    private currentIndex: number = 0;
    private audioBufferSourceNodes: AudioBufferSourceNode[] = [];

    constructor(poolSize: number, audioContext: AudioContext, audioBuffer: AudioBuffer) {
        this.poolSize = poolSize;
        this.audioContext = audioContext;
        this.audioBuffer = audioBuffer;
    }

    public initializePool(): Promise<SoundPool> {
        return new Promise<SoundPool>((resolve, reject) => {
            if (this.audioBufferSourceNodes.length >= this.poolSize) {
                resolve(this);
                return;
            }
            try {
                for (let i = 0; i < this.poolSize; i++) {
                    const audioBuffereSource = this.audioContext.createBufferSource();
                    audioBuffereSource.buffer = this.audioBuffer;
                    this.audioBufferSourceNodes.push(audioBuffereSource);
                }
                resolve(this);
            } catch (error) {
                reject(error);
            }
        });
    }

    public getAudioBufferSource(): AudioBufferSourceNode {
        const audioBufferSource = this.audioBufferSourceNodes[this.currentIndex];
        audioBufferSource.connect(this.audioContext.destination);
        this.currentIndex = (this.currentIndex + 1) % this.poolSize;
        return audioBufferSource;
    }
}