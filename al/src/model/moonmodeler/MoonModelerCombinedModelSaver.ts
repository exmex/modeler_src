import { CombinedModel } from "../CombinedModel";
import { CombinedModelSaver } from "../../source/CombinedModelSaver";
import { MMVertice } from "./MMVertice";
import { MoonModelerModel } from "common";

export class MoonModelerCombinedModelSaver extends CombinedModelSaver<MoonModelerModel> {
  protected transformModel(
    combinedModel: CombinedModel<MoonModelerModel>
  ): MoonModelerModel {
    const result = combinedModel.originalModel;
    const diagramItems = result.diagrams[this.diagramId].diagramItems;

    for (const component of combinedModel.components) {
      for (const vertice of component.vertices) {
        const mmVertice = vertice as MMVertice;

        diagramItems[mmVertice.id].x = mmVertice.left + component.shape.left;
        diagramItems[mmVertice.id].y = mmVertice.top + component.shape.top;
        //diagramItems[mmVertice.id].gWidth = mmVertice.width;
        //diagramItems[mmVertice.id].gHeight = mmVertice.height;
      }
    }
    return result;
  }
}
