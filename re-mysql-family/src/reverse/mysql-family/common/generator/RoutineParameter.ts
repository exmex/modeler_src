export class RoutineParameter {
    public fncIn: boolean;
    public fncOut: boolean;
    public fncInout: boolean;
    public name: string;
    public type: string;

    public constructor(fncIn: boolean, fncOut: boolean, fncInout: boolean, name: string, type: string) {
        this.fncIn = fncIn;
        this.fncOut = fncOut;
        this.fncInout = fncInout;
        this.name = name;
        this.type = type;
    }
}
