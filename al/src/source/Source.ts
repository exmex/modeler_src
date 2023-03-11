import { MoonModelerModel } from "common";

export abstract class Source<T extends MoonModelerModel> {
    public abstract loadModel(): T;
    public abstract storeModel(model: T): void;
}