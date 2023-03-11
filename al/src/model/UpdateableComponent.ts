import { Edge } from "./Edge";
import { Shape } from "./Shape";
import { Vertice } from "./Vertice";

export class UpdateableComponent {
    public shape: Shape = new Shape(0, 0, 0, 0);
    public edges: Edge[] = [];
    public vertices: Vertice[] = [];

    public constructor(vertices: Vertice[], edges: Edge[]) {
        this.vertices = vertices;
        this.edges = edges;
    }

    public update(): void {
        for (const vertice of this.vertices) {
            this.shape.width = Math.max(this.shape.width, vertice.left + vertice.width);
            this.shape.height = Math.max(this.shape.height, vertice.top + vertice.height);
        }
    }
}
