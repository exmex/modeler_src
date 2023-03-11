import { AutolayoutModel } from "./AutolayoutModel";
import { Component } from "./Component";
import { Edge } from "./Edge";
import { MoonModelerModel } from "common";
import { UpdateableComponent } from "./UpdateableComponent";
import { Vertice } from "./Vertice";

export class CombinedModel<T extends MoonModelerModel>
  extends UpdateableComponent
  implements AutolayoutModel
{
  public originalModel: T;
  public components: Component[] = [];
  public startPoint: { x: number; y: number };

  public constructor(
    originalModel: T,
    vertices: Vertice[],
    edges: Edge[],
    startPoint: { x: number; y: number }
  ) {
    super(vertices, edges);
    this.originalModel = originalModel;
    this.startPoint = startPoint;
  }
}
