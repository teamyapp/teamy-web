export class Color {
    constructor(
        public red: number,
        public green: number,
        public blue: number,
        public alpha: number = 1,
    ) {}

    equals(other: Color): boolean {
        return (
            this.red === other.red &&
            this.green === other.green &&
            this.blue === other.blue &&
            this.alpha === other.alpha
        );
    }
}
