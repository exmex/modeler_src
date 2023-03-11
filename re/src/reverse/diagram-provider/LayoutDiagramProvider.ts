import { MoonModelerModel } from "common";

export interface LayoutDiagramProvider {
  provide(model: MoonModelerModel): string;
}
