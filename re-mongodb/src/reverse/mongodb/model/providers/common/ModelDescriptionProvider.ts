import { ModelDescription, getAppVersionObject } from "common";
import { ModelPartProvider, NamesRegistry, Platform, ReverseOptions } from "re";

import { v4 as uuidv4 } from "uuid";

export class ModelDescriptionProvider
  implements ModelPartProvider<ModelDescription>
{
  public constructor(
    private _namesRegistry: NamesRegistry,
    private _reverseOptions: ReverseOptions
  ) {}
  public provide(): Promise<ModelDescription> {
    const activeDiagram = this._namesRegistry.diagrams.find(() => true);
    return Promise.resolve({
      activeDiagram: activeDiagram ? activeDiagram.id : uuidv4(),
      desc: "",
      name: this._reverseOptions.connectionName,
      id: uuidv4(),
      path: "",
      type: Platform.MONGODB,
      version: 1,
      keysgraphics: true,
      linegraphics: "detailed",
      zoom: 100,
      parentTableInFkCols: true,
      caseConvention: "under",
      replaceSpace: "_",
      color: "transparent",
      background: "transparent",
      sideSelections: true,
      isDirty: true,
      storedin: getAppVersionObject(process.env.CURRENT_PRODUCT),
      def_tabletype: "na",
      def_collation: "",
      def_charset: "",
      def_coltopk: true,
      def_rowformat: "na",
      reversed: true,
      def_others: "",
      filePath: "",
      lastSaved: "",
      embeddedInParentsIsDisplayed: true,
      schemaContainerIsDisplayed: false,
      cardinalityIsDisplayed: false,
      estimatedSizeIsDisplayed: false,
      writeFileParam: false,
      currentDisplayMode: "metadata"
    });
  }
}
