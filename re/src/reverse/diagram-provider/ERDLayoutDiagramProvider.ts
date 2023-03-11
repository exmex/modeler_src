import { LayoutDiagramProvider } from "./LayoutDiagramProvider";
import { MoonModelerModel } from "common";
import _ from "lodash";

export class ERDLayoutDiagramProvider implements LayoutDiagramProvider {
  public provide(model: MoonModelerModel): string {
    return _.find(
      model.diagrams,
      (diagram) => diagram.main && diagram.type === "erd"
    )?.id;
  }
}
