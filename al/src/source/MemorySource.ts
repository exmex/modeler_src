import { MoonModelerModel } from "common";
import { Source } from "./Source";

export class MemorySource<T extends MoonModelerModel> extends Source<T> {
    private model: T;

    public constructor(model: T) {
        super();
        this.model = model;
    }

    public loadModel(): T {
        return this.model;
    }

    public storeModel(_model: T): void {
        // abstract method
    }
}