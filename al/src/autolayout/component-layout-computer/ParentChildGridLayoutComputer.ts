import { Component } from "../../model/Component";
import { ComponentLayoutComputer } from "./ComponentLayoutComputer";
import { MMEdge } from "../../model/moonmodeler/MMEdge";
import { MMVertice } from "../../model/moonmodeler/MMVertice";

export interface Position {
    x: number;
    y: number;
    lane: number;
}

export class GridItem {
    constructor(public vertex: MMVertice, public position: Position) { }
}
export class Grid {
    private readonly HMARGIN: number = 85;
    private readonly VMARGIN: number = 10;

    constructor(private maxWidth: number = 0, private items: GridItem[] = [], private edges: MMEdge[] = []) { }

    public switchParentChildLane(e: MMEdge) {
        const a = this.getByVertex(e.source);
        const b = this.getByVertex(e.target);
        if ((a && b) && (a.position.lane <= b.position.lane)) {
            this.move(e.target, { lane: a.position.lane - 1, x: a.vertex.left - this.maxWidth - this.HMARGIN, y: a.vertex.top });
        }
    }

    public clear() {
        this.items = [];
        this.edges = [];
    }

    public assignPositions() {
        const minRow = this.items.reduce((r, i) => Math.min(i.position.y, r), 0);
        const minCol = this.items.reduce((r, i) => Math.min(i.position.x, r), 0);
        const minLane = this.items.reduce((r, i) => Math.min(i.position.lane, r), 0);

        this.items
            .forEach((i) => {
                i.position.x = i.position.x - minCol;
                i.position.y = i.position.y - minRow;
                i.position.lane = i.position.lane - minLane;

                i.vertex.left = i.position.x;
                i.vertex.top = i.position.y;
            });
        const maxLane = this.items.reduce((r, i) => Math.max(i.position.lane, r), 0);

        [...Array(maxLane + 1).keys()].forEach((i) => {
            let max = 0;
            this.items.filter((item) => item.position.lane === i).sort((a, b) => a.vertex.top - b.vertex.top)
                .forEach((item) => {
                    if (item.vertex.top < max) {
                        item.vertex.top = max;
                    }
                    max = item.vertex.top + item.vertex.height + this.VMARGIN;
                });
        });
    }

    public getNextInLane(lane: number) {
        return this.items.filter((i) => i.position.lane === lane).reduce((r, i) => i.vertex.top + i.vertex.height + this.VMARGIN, 0);
    }

    public add(edge: MMEdge | undefined, vertex: MMVertice, position: Position): boolean {
        if (edge) {
            if (this.edges.find((e) => edge === e)) {
                return false;
            }
            this.edges.push(edge);
        }

        const existing = this.getByVertex(vertex);
        if (existing) {
            return false;
        } else {
            this.items.push(new GridItem(vertex, position));
            return true;
        }
    }

    public get(position: Position): GridItem | undefined {
        return this.items.find((item) => item.position.x === position.x && item.position.y === position.y);
    }

    public getByVertex(vertex: MMVertice): GridItem | undefined {
        return this.items.find((item) => item.vertex === vertex);
    }

    public move(v: MMVertice, newPosition: Position): void {
        const item = this.getByVertex(v);
        if (item) {
            item.position = newPosition;
            item.vertex.left = newPosition.x;
            item.vertex.top = newPosition.y;
        }
    }
}

export class ParentChildGridLayoutComputer implements ComponentLayoutComputer {
    private readonly HMARGIN: number = 135;
    private readonly ROWSIZE: number = 18;
    private maxLaneWidth: number = 0;
    private grid: Grid = new Grid();

    public compute(component: Component): void {
        this.maxLaneWidth = [...component.vertices].reduce((r, i) => i.width > r ? i.width : r, this.maxLaneWidth);
        this.grid = new Grid(this.maxLaneWidth);
        this.grid.clear();
        let availableVertices = [...component.vertices]
            .filter((vertex) => (!this.grid.getByVertex(vertex as MMVertice)) || (vertex.edges.filter((e) => e.source === vertex).length === 0));

        let start = { x: 0, y: 0, lane: 0 }
        if (availableVertices.length > 0) {
            const centerVertex = availableVertices[0] as MMVertice;
            const foundVertex = this.grid.getByVertex(centerVertex);
            if (!foundVertex) {
                this.addVertexAndAllParents(undefined, centerVertex, start, 1);
            }
        }

        component.edges.map((e) => e as MMEdge).forEach((e) => {
            this.grid.switchParentChildLane(e);
        });

        this.grid.assignPositions();
    }

    private remainingChildren(vertex: MMVertice, sortedEdges: MMEdge[]) {
        return sortedEdges.filter((e) => (e.target !== vertex));
    }

    private remainingParents(vertex: MMVertice, sortedEdges: MMEdge[]) {
        return sortedEdges.filter((e) => (e.source !== vertex));
    }

    private getParentPosition(edge: MMEdge, startVertex: MMVertice, startPosition: Position) {
        return {
            x: startVertex.left + this.maxLaneWidth + this.HMARGIN,
            y: Math.max(startVertex.top + (edge.childColIndex) * this.ROWSIZE, this.grid.getNextInLane(startPosition.lane + 1)),
            lane: startPosition.lane + 1,
        }
    }

    private getChildPosition(edge: MMEdge, startVertex: MMVertice, startPosition: Position) {
        return {
            x: startVertex.left - this.maxLaneWidth - this.HMARGIN,
            y: Math.max(startVertex.top - (edge.childColIndex) * this.ROWSIZE, this.grid.getNextInLane(startPosition.lane - 1)),
            lane: startPosition.lane - 1,
        }
    }

    private addVertexAndAllParents(startEdge: MMEdge | undefined, startVertex: MMVertice, position: Position, direction: number): boolean {
        const result = this.grid.add(startEdge, startVertex, position);
        if (!result) {
            return false;
        }
        startVertex.left = position.x;
        startVertex.top = position.y;
        const sortedEdges = this.sortEdges(startVertex);
        if (direction === 1) {
            this.addRemaingParents(startVertex, sortedEdges, position);
            this.addRemainingChildren(startVertex, sortedEdges, position);
        } else {
            this.addRemainingChildren(startVertex, sortedEdges, position);
            this.addRemaingParents(startVertex, sortedEdges, position);
        }
        return true;
    }

    private sortEdges(v: MMVertice) {
        return v.edges.sort((a, b) => a.childColIndex - b.childColIndex);
    }

    private addRemainingChildren(v: MMVertice, sortedEdges: MMEdge[], position: Position) {
        this.remainingChildren(v, sortedEdges).forEach((e) => {
            const newPosition = this.getChildPosition(e, v, position);
            this.addVertexAndAllParents(e, e.target, newPosition, -1);
        });
    }

    private addRemaingParents(v: MMVertice, sortedEdges: MMEdge[], position: Position) {
        this.remainingParents(v, sortedEdges).forEach((e) => {
            const newPosition = this.getParentPosition(e, v, position);
            this.addVertexAndAllParents(e, e.source, newPosition, 1);
        });
    }
}
