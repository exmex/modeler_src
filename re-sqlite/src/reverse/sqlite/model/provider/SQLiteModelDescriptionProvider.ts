import {
  KnownIdRegistry,
  ModelPartProvider,
  NamesRegistry,
  Platform,
  ReverseOptions
} from "re";
import { ModelDescription, getAppVersionObject } from "common";

import { v4 as uuidv4 } from "uuid";

export class SQLiteModelDescriptionProvider
  implements ModelPartProvider<ModelDescription>
{
  public constructor(
    private reverseOptions: ReverseOptions,
    private _namesRegistry: NamesRegistry,
    private knownIdRegistry: KnownIdRegistry
  ) {}
  public async provide(): Promise<ModelDescription> {
    const activeDiagram = this._namesRegistry.diagrams.find(() => true);

    const originalModelDescription = this.knownIdRegistry.getModelDescription();
    if (!!originalModelDescription) {
      return {
        ...originalModelDescription,
        connectionId: this.reverseOptions.connectionId,
        storedin: getAppVersionObject(process.env.CURRENT_PRODUCT)
      };
    }

    return {
      connectionId: this.reverseOptions.connectionId,
      activeDiagram: activeDiagram ? activeDiagram.id : uuidv4(),
      caseConvention: "under",
      color: "transparent",
      def_coltopk: true,
      desc: "",
      id: uuidv4(),
      isDirty: true,
      name: "SQLite",
      parentTableInFkCols: true,
      path: "",
      replaceSpace: "_",
      sideSelections: true,
      storedin: getAppVersionObject(process.env.CURRENT_PRODUCT),
      type: Platform.SQLITE,
      version: 1,
      filePath: "",
      lastSaved: "",
      cardinalityIsDisplayed: false,
      sqlSettings: {
        wrapLines: true,
        wrapOffset: 80,
        indent: true,
        indentationString: "spaces",
        indentationSize: 2,
        limitItemsOnLine: true,
        maxListItemsOnLine: 3,
        statementDelimiter: ";",
        routineDelimiter: ";",
        keywordCase: "upper",
        identiferCase: "original"
      },
      embeddedInParentsIsDisplayed: true,
      schemaContainerIsDisplayed: false,
      estimatedSizeIsDisplayed: false,
      writeFileParam: false,
      currentDisplayMode: "metadata"
    };
  }
}
