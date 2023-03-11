export class Shape {
    public left: number;
    public top: number;
    public width: number;
    public height: number;

    public constructor(left: number, top: number, width: number, height: number) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }

    public autoSize(): void {
        // no impl
    }
}
