import { Edge } from "../Edge";
import { MMVertice } from "./MMVertice";

export class MMEdge implements Edge {
    public source: MMVertice;
    public target: MMVertice;
    public parentColIndex: number;
    public childColIndex: number;

    public constructor(source: MMVertice, target: MMVertice, parentColIndex: number, childColIndex: number) {
        this.source = source;
        this.target = target;
        this.parentColIndex = parentColIndex;
        this.childColIndex = childColIndex;
    }
}
