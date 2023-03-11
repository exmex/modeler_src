import { Vertice } from "./Vertice";

export interface Edge {
    source: Vertice;
    target: Vertice;
    parentColIndex: number;
    childColIndex: number;
}
