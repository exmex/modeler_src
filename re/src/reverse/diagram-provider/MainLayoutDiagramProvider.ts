import { LayoutDiagramProvider } from "./LayoutDiagramProvider";
import { MoonModelerModel } from "common";

export class MainLayoutDiagramProvider implements LayoutDiagramProvider {
  public provide(model: MoonModelerModel): string {
    return model.model.activeDiagram;
  }
}
