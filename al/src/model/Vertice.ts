import { Edge } from "./Edge";
import { Shape } from "./Shape";

export interface Vertice extends Shape {
    edges: Edge[];
}
