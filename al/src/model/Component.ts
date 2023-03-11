import { Edge } from "./Edge";
import { Shape } from "./Shape";
import { Vertice } from "./Vertice";

export interface Component {
    shape: Shape;
    edges: Edge[];
    vertices: Vertice[];

    update(): void;
}
