import { Component } from "../../model/Component";
import { MMEdge } from "../../model/moonmodeler/MMEdge";
import { MMVertice } from "../../model/moonmodeler/MMVertice";
import { EdgeSorter } from "./EdgeSorter";
import { ComponentLayoutComputer } from "./ComponentLayoutComputer";

export class SimpleGridLayoutComputer implements ComponentLayoutComputer {
    private readonly HMARGIN: number = 85;
    private readonly VMARGIN: number = 30;

    public compute(component: Component): void {
        const cellSize = this.calculateCellSize(component);
        const matrixSize = Math.ceil(Math.sqrt(component.vertices.length));
        const line: MMVertice[] = new Array<MMVertice>(matrixSize * matrixSize);

        let remainingVertices = [...component.vertices].map((v): MMVertice => v as MMVertice).sort((a, b): number => b.edges.length - a.edges.length);

        const used: MMEdge[] = [];
        while (remainingVertices.length > 0) {
            remainingVertices = this.build(0, remainingVertices[0], line, remainingVertices, used);
        }

        line.forEach((vertice, index): void => {
            const row = Math.ceil(index / matrixSize);
            const col = index % matrixSize;

            vertice.left = this.HMARGIN + (col * cellSize.width) + Math.floor((cellSize.width - vertice.width) / 2);
            vertice.top = this.VMARGIN + (row * cellSize.height) + Math.floor((cellSize.height - vertice.height) / 2);
        });
    }

    private build(
        center: number,
        vertice: MMVertice,
        line: MMVertice[],
        remainingVertices: MMVertice[],
        used: MMEdge[],
    ): MMVertice[] {
        remainingVertices = this.setVertice(line, center, vertice, remainingVertices);
        const sortedEdges = new EdgeSorter(vertice.edges, vertice).sort();

        for (const edge of sortedEdges) {
            if (!used.find((usedEdge): boolean => usedEdge === edge)) {
                used.push(edge as MMEdge);
                if (!line.find((usedVertice) => usedVertice === vertice)) {
                    const next = edge.source === vertice ? edge.target : edge.source;
                    remainingVertices = this.build(
                        this.getNearestCell(vertice, line),
                        next as MMVertice,
                        line,
                        remainingVertices,
                        used,
                    );
                }
            }
        }
        return remainingVertices;
    }

    private getNearestCell(vertice: MMVertice, line: MMVertice[]): number {
        const rowSize = Math.ceil(Math.sqrt(line.length));
        if (line.indexOf(vertice) + 1 >= line.length) {
            return this.findPreviousEmpty(line, line.indexOf(vertice));
        }

        const nextItem = (line.indexOf(vertice) + 1) % line.length;
        let col = nextItem % rowSize;
        while (col < rowSize) {
            let row = Math.ceil(nextItem / rowSize);
            const maxRow = Math.ceil(line.length / rowSize);

            while (row < maxRow) {
                const index = (row * rowSize) + col;
                if (!line[index]) {
                    return index;
                }
                row++;
            }
            col++;
        }

        return this.findEmpty(line, nextItem);
    }

    private setVertice(line: MMVertice[], center: number, vertice: MMVertice, remainingVertices: MMVertice[]): MMVertice[] {
        const found = remainingVertices.find((item): boolean => item === vertice);
        if (found) {
            const index = this.findEmpty(line, center);
            line[index] = vertice;
            return remainingVertices.filter((item): boolean => item !== vertice);
        }
        return remainingVertices;
    }

    private findEmpty(line: MMVertice[], center: number): number {
        let index = center;
        while (line[index]) {
            index = (index + 1) % line.length;
        }
        return index;
    }

    private findPreviousEmpty(line: MMVertice[], center: number): number {
        let index = center;
        while (line[index]) {
            index = (index - 1) % line.length;
        }
        return index;
    }

    private calculateCellSize(component: Component): { width: number; height: number } {
        return {
            height: this.VMARGIN + component.vertices.map((v): MMVertice => v as MMVertice).reduce((a, b): MMVertice => a.height > b.height ? a : b).height,
            width: this.HMARGIN + component.vertices.map((v): MMVertice => v as MMVertice).reduce((a, b): MMVertice => a.width > b.width ? a : b).width,
        };
    }
}
