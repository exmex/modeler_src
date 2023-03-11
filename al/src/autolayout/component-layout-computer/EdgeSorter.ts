import { Edge } from "../../model/Edge";
import { Vertice } from "../../model/Vertice";

export class EdgeSorter {
    private edges: Edge[];
    private source: Vertice;

    public constructor(edges: Edge[], source: Vertice) {
        this.edges = edges;
        this.source = source;
    }

    public sort(): Edge[] {
        const childEdges = this.edges
            .filter((edge): boolean  => edge.source !== this.source)
            .sort((a, b): number => a.childColIndex - b.childColIndex);
        const parentEdges = this.edges
            .filter((edge): boolean => edge.source === this.source)
            .sort((a, b): number => a.parentColIndex - b.parentColIndex);
        return [...parentEdges, ...childEdges];
    }
}
