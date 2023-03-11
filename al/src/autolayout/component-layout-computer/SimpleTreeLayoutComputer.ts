import { EdgeSorter } from "./EdgeSorter";
import { ComponentLayoutComputer } from "./ComponentLayoutComputer";
import { Component } from "../../model/Component";
import { Vertice } from "../../model/Vertice";
import { Edge } from "../../model/Edge";

export class SimpleLayoutComputer implements ComponentLayoutComputer {
    private readonly SMALLMARGIN = 50;
    private widthMargin = 7 * this.SMALLMARGIN;

    public compute(component: Component): void {
        this.widthMargin = component.vertices.reduce((r, i) => i.width > r ? i.width : r, 0) + 1 * this.SMALLMARGIN;

        const vertice = component.vertices.reduce((a, b): Vertice => a.edges.length > b.edges.length ? a : b);
        if (vertice) {
            this.calculate(vertice, vertice.edges, this.SMALLMARGIN, this.SMALLMARGIN, [vertice]);
        }
    }

    private calculate(source: Vertice, edges: Edge[], left: number, top: number, used: Vertice[]): number {
        source.left = left;
        source.top = top;
        let lastVerticalPosition = 0;

        const sortedEdges = new EdgeSorter(edges, source).sort();

        for (const edge of sortedEdges) {
            lastVerticalPosition = this.processEdge(edge, source, used, lastVerticalPosition, left);
        }

        return Math.max(
            source.height,
            lastVerticalPosition - source.top,
        ) + this.SMALLMARGIN;
    }

    private processEdge(
        edge: Edge,
        source: Vertice,
        used: Vertice[],
        lastVerticalPosition: number,
        left: number,
    ): number {
        const next = (edge.source === source) ? edge.target : edge.source;
        if (used.filter((item): boolean => next === item).length === 0) {
            used.push(next);
            lastVerticalPosition += this.calculate(
                next,
                next.edges,
                left + this.widthMargin,
                source.top + lastVerticalPosition + this.SMALLMARGIN,
                used,
            );
        }
        return lastVerticalPosition;
    }
}
