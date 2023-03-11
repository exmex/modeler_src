import { EAutoLayoutType } from "./autolayout/EAutoLayoutType";
import { FileSource } from "./source/FileSource";
import { ModelAutolayout } from "./ModelAutolayout";
import { MoonModelerCombinedModelLoader } from "./model/moonmodeler/MoonModelerCombinedModelLoader";
import { MoonModelerCombinedModelSaver } from "./model/moonmodeler/MoonModelerCombinedModelSaver";

export class ModelerAutolayout {
  public constructor(
    private inputFile: string,
    private outputFile: string,
    private autolayoutType: EAutoLayoutType,
    private autoSize: boolean,
    private expandNested: boolean,
    private diagramId: string
  ) {}

  public run(): void {
    const modelLoader = new MoonModelerCombinedModelLoader(
      new FileSource(this.inputFile),
      this.expandNested,
      this.diagramId
    );
    const model = modelLoader.load();

    const modelAutolayout = new ModelAutolayout(
      this.autolayoutType,
      this.autoSize
    );
    modelAutolayout.autolayout(model);

    const saver = new MoonModelerCombinedModelSaver(
      new FileSource(this.outputFile),
      this.diagramId
    );
    saver.save(model);
  }
}
