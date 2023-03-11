import { AutoLayoutFactory } from "./autolayout/AutoLayoutFactory";
import { AutoSize } from "./model/AutoSize";
import { AutolayoutModel } from "./model/AutolayoutModel";
import { EAutoLayoutType } from "./autolayout/EAutoLayoutType";

export class ModelAutolayout {
  public constructor(
    private type: EAutoLayoutType,
    private autosize: boolean
  ) {}

  public autolayout(model: AutolayoutModel): void {
    if (this.autosize === true) {
      const autoSize = new AutoSize();
      autoSize.resize(model);
    }

    const alf = new AutoLayoutFactory();
    const autoLayout = alf.create(model, this.type);
    autoLayout.execute();
  }
}
