import { CombinedModel } from "../model/CombinedModel";
import { MoonModelerModel } from "common";
import { Source } from "./Source";

export abstract class CombinedModelSaver<T extends MoonModelerModel> {
    public constructor(private _source: Source<T>, private _diagramId: string) { }

    protected get diagramId() {
        return this._diagramId;
    }

    public save(combinedModel: CombinedModel<T>): void {
        const result = this.transformModel(combinedModel);
        this._source.storeModel(result);
    }

    protected abstract transformModel(combinedModel: CombinedModel<T>): T;
}
