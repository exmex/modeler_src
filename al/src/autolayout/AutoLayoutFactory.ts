import { AutoLayout } from "./AutoLayout";
import { AutolayoutModel } from "../model/AutolayoutModel";
import { ComponentLayoutComputer } from "./component-layout-computer/ComponentLayoutComputer";
import { EAutoLayoutType } from "./EAutoLayoutType";
import { ParentChildGridLayoutComputer } from "./component-layout-computer/ParentChildGridLayoutComputer";
import { SimpleGridLayoutComputer } from "./component-layout-computer/SimpleGridLayoutComputer";
import { SimpleLayoutComputer } from "./component-layout-computer/SimpleTreeLayoutComputer";

export class AutoLayoutFactory {
  public create(autolayoutModel: AutolayoutModel, type: string): AutoLayout {
    const layoutComputer = this.getLayoutComputer(type);
    return new AutoLayout(autolayoutModel, layoutComputer);
  }

  private getLayoutComputer(type: string): ComponentLayoutComputer {
    switch (type) {
      case EAutoLayoutType.SimpleGrid:
        return new SimpleGridLayoutComputer();
      case EAutoLayoutType.ParentChildrenGrid:
        return new ParentChildGridLayoutComputer();
    }
    return new SimpleLayoutComputer();
  }
}
