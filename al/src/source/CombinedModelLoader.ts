import { CombinedModel } from "../model/CombinedModel";
import { Edge } from "../model/Edge";
import { MoonModelerModel } from "common";
import { Source } from "./Source";
import { Vertice } from "../model/Vertice";

export abstract class CombinedModelLoader<T extends MoonModelerModel> {
    public constructor(private source: Source<T>, private _expandNested: boolean, private _diagramId: string) { }

    protected get expandNested(): boolean {
        return this._expandNested;
    }

    protected get diagramId(): string {
        return this._diagramId;
    }

    public load(): CombinedModel<T> {
        const modelData = this.source.loadModel();

        const vertices = this.loadVertices(modelData);
        const edges = this.loadEdges(modelData, vertices);

        return this.createModel(modelData, vertices, edges);
    }

    protected abstract createModel(modelData: object, vertices: Vertice[], edges: Edge[]): CombinedModel<T>;
    protected abstract loadEdges(modelData: object, vertices: Vertice[]): Edge[];
    protected abstract loadVertices(modelData: object): Vertice[];
}
