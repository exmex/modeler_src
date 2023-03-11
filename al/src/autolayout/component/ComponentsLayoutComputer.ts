import { AutolayoutModel } from "../../model/AutolayoutModel";
import { Component } from "../../model/Component";

const FIRST_COLUMN_HORIZONTAL_MARGIN = 50;
const FIRST_COLUMN_VERTICAL_MARGIN = 40;
const BIG_COMPONENT_MARGIN = 50;
const SMALL_COMPONENT_MARGIN = 30;
const MAX_ROW_WIDTH = 1200;

export class ComponentsLayoutComputer {
  public constructor(private startPoint: { x: number; y: number }) {}

  public compute(model: AutolayoutModel): void {
    let shiftVertical = FIRST_COLUMN_VERTICAL_MARGIN + this.startPoint.y;
    let shiftHorizontal = FIRST_COLUMN_HORIZONTAL_MARGIN + this.startPoint.x;
    let rowHeight = 0;

    for (const component of model.components) {
      if (this.canComponentFitHorizontally(component, shiftHorizontal)) {
        component.shape.top = shiftVertical;
        component.shape.left = shiftHorizontal;

        shiftHorizontal += component.shape.width + SMALL_COMPONENT_MARGIN;
        rowHeight = Math.max(rowHeight, this.initialRowHeight(component));
      } else {
        shiftHorizontal = FIRST_COLUMN_HORIZONTAL_MARGIN;
        shiftVertical += rowHeight;
        component.shape.top = shiftVertical;
        component.shape.left = shiftHorizontal;

        rowHeight = this.initialRowHeight(component);
        shiftHorizontal +=
          component.shape.width + this.getComponentMargin(component);
      }
    }
  }

  private initialRowHeight(component: Component): number {
    return component.shape.height + SMALL_COMPONENT_MARGIN;
  }

  private getComponentMargin(component: Component) {
    return this.isBigComponent(component) === true
      ? BIG_COMPONENT_MARGIN
      : SMALL_COMPONENT_MARGIN;
  }

  private isBigComponent(component: Component) {
    return component.vertices.length > 0;
  }

  private canComponentFitHorizontally(
    component: Component,
    shiftHorizontal: number
  ): boolean {
    return component.shape.width + shiftHorizontal < MAX_ROW_WIDTH;
  }
}
