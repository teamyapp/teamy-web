export interface RandomNumberGenerator {
    randomFloat(): number;
}

export class BuiltInRandomNumberGenerator implements RandomNumberGenerator {
    randomFloat(): number {
        return Math.random();
    }
}

export class TestRandomNumberGenerator implements RandomNumberGenerator {
    private randomFloats: number[] = [];
    private nextRandomFloatIndex: number = 0;

    randomFloat(): number {
        if (!this.randomFloats.length) {
            return 0;
        }

        const num = this.randomFloats[this.nextRandomFloatIndex];
        this.nextRandomFloatIndex++;
        return num;
    }

    setRandomFloats(randomFloats: number[]) {
        this.randomFloats = randomFloats;
        this.nextRandomFloatIndex = 0;
    }
}
