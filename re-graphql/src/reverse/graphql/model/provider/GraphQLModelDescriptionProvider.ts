import { ModelDescription, getAppVersionObject } from "common";
import { ModelPartProvider, NamesRegistry, Platform, ReverseOptions } from "re";

import { v4 as uuidv4 } from "uuid";

export class GraphQLModelDescriptionProvider
  implements ModelPartProvider<ModelDescription>
{
  public constructor(
    private _namesRegistry: NamesRegistry,
    private _reverseOptions: ReverseOptions
  ) {}
  public async provide(): Promise<ModelDescription> {
    const activeDiagram = this._namesRegistry.diagrams.find(() => true);
    return {
      activeDiagram: activeDiagram ? activeDiagram.id : uuidv4(),
      name: this._reverseOptions.connectionName,
      id: uuidv4(),
      desc: "",
      path: "",
      type: Platform.GRAPHQL,
      version: 1,
      parentTableInFkCols: false,
      caseConvention: "under",
      replaceSpace: "_",
      color: "transparent",
      sideSelections: true,
      isDirty: true,
      storedin: getAppVersionObject(process.env.CURRENT_PRODUCT),
      def_coltopk: true,
      def_others: "",
      filePath: "",
      lastSaved: "",
      def_charset: "",
      def_collation: "",
      def_rowformat: "",
      def_tabletype: "",
      embeddedInParentsIsDisplayed: true,
      schemaContainerIsDisplayed: false,
      cardinalityIsDisplayed: false,
      estimatedSizeIsDisplayed: false,
      writeFileParam: false,
      currentDisplayMode: "metadata"
    };
  }
}
