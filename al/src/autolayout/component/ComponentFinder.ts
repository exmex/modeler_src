import { Component } from "../../model/Component";
import { UpdateableComponent } from "../../model/UpdateableComponent";
import { Vertice } from "../../model/Vertice";
import { AutolayoutModel } from "../../model/AutolayoutModel";
import { Edge } from "../../model/Edge";

export class ComponentFinder {
    public find(model: AutolayoutModel): Component[] {
        let result: Component[] = [];

        for (const edge of model.edges) {
            const sourceComponent = this.findComponent(result, edge.source);
            const targetComponent = this.findComponent(result, edge.target);

            if (sourceComponent && targetComponent && (sourceComponent !== targetComponent)) {
                result = this.mergeComponent(result, sourceComponent, targetComponent);
            } else if (sourceComponent && !targetComponent) {
                this.addToComponent(sourceComponent, edge.target, edge);
            } else if (!sourceComponent && targetComponent) {
                this.addToComponent(targetComponent, edge.source, edge);
            } else if (!sourceComponent && !targetComponent) {
                result = this.createComponentForEdge(result, edge);
            }
        }

        for (const vertice of model.vertices) {
            const component = this.findComponent(result, vertice);
            if (!component) {
                result = this.createComponentForVertice(result, vertice);
            }

        }
        return result;
    }

    private createComponentForEdge(components: Component[], edge: Edge): Component[] {
        return [...components, new UpdateableComponent([edge.source, edge.target], [edge])];
    }

    private createComponentForVertice(components: Component[], vertice: Vertice): Component[] {
        return [...components, new UpdateableComponent([vertice], [])];
    }

    private mergeComponent(
        components: Component[],
        sourceComponent: Component,
        targetComponent: Component,
    ): Component[] {
        targetComponent.edges = [...targetComponent.edges, ...sourceComponent.edges];
        targetComponent.vertices = [...targetComponent.vertices, ...sourceComponent.vertices];

        return components.filter((component): boolean => component !== sourceComponent);
    }

    private addToComponent(component: Component, vertice: Vertice, edge: Edge): void {
        component.edges.push(edge);
        component.vertices.push(vertice);
    }

    private findComponent(components: Component[], searchedVertice: Vertice): Component | undefined {
        for (const component of components) {
            for (const vertice of component.vertices) {
                if (vertice === searchedVertice) {
                    return component;
                }
            }
        }
        return undefined;
    }
}
