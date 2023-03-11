import { EAutoLayoutType } from "./autolayout/EAutoLayoutType";
import { MemorySource } from "./source/MemorySource";
import { ModelAutolayout } from "./ModelAutolayout";
import { MoonModelerCombinedModelLoader } from "./model/moonmodeler/MoonModelerCombinedModelLoader";
import { MoonModelerCombinedModelSaver } from "./model/moonmodeler/MoonModelerCombinedModelSaver";
import { MoonModelerModel } from "common";

export class MemoryAutolayout {
  public constructor(
    private expandNested: boolean,
    private type: EAutoLayoutType
  ) {}

  public layout(model: MoonModelerModel, diagram: string): void {
    const source = new MemorySource(model);
    const loader = new MoonModelerCombinedModelLoader(
      source,
      this.expandNested,
      diagram
    );
    const combinedModel = loader.load();
    const modelAutolayout = new ModelAutolayout(this.type, true);
    modelAutolayout.autolayout(combinedModel);
    const saver = new MoonModelerCombinedModelSaver(source, diagram);
    saver.save(combinedModel);
  }
}
