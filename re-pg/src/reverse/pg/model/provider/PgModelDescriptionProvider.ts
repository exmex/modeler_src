import {
  KnownIdRegistry,
  ModelPartProvider,
  NamesRegistry,
  Platform,
  ReverseOptions
} from "re";
import { ModelDescription, getAppVersionObject } from "common";

import { PgQuotation } from "../../../../db/pg/pg-quotation";
import { PgSchemaRE } from "../../re/PgSchemaRE";
import { v4 as uuidv4 } from "uuid";

export class PgModelDescriptionProvider
  implements ModelPartProvider<ModelDescription>
{
  public constructor(
    private schema: string,
    private reverseOptions: ReverseOptions,
    private schemaRE: PgSchemaRE,
    private quotation: PgQuotation,
    private namesRegistry: NamesRegistry,
    private knownIdRegistry: KnownIdRegistry
  ) {}
  private getQuotedComment(comment: string): string {
    return comment ? comment.replace(/'/g, "''") : "";
  }
  public async provide(): Promise<ModelDescription> {
    const diagram = this.namesRegistry.diagrams.find(() => true);
    const schemaMetadata = await this.schemaRE.reverse();
    const originalModelDescription = this.knownIdRegistry.getModelDescription();
    if (!!originalModelDescription) {
      return {
        ...originalModelDescription,
        connectionId: this.reverseOptions.connectionId,
        storedin: getAppVersionObject(process.env.CURRENT_PRODUCT),
        pg: {
          schema: this.reverseOptions.includeSchema === true ? this.schema : ``
        },
        beforeScript: schemaMetadata?.description
          ? `COMMENT ON SCHEMA ${this.quotation.quoteIdentifier(
              this.schema
            )} IS '${this.getQuotedComment(schemaMetadata.description)}';`
          : ""
      };
    }
    return {
      connectionId: this.reverseOptions.connectionId,
      activeDiagram: diagram ? diagram.id : uuidv4(),
      caseConvention: "under",
      color: "transparent",
      def_coltopk: true,
      desc: "",
      id: uuidv4(),
      isDirty: true,
      name: this.reverseOptions.connectionName,
      parentTableInFkCols: true,
      path: "",
      replaceSpace: "_",
      sideSelections: true,
      storedin: getAppVersionObject(process.env.CURRENT_PRODUCT),
      type: Platform.PG,
      version: 1,
      filePath: "",
      lastSaved: "",
      cardinalityIsDisplayed: false,
      pg: {
        schema: this.reverseOptions.includeSchema === true ? this.schema : ``
      },
      beforeScript: schemaMetadata?.description
        ? `COMMENT ON SCHEMA ${this.quotation.quoteIdentifier(
            this.schema
          )} IS '${this.getQuotedComment(schemaMetadata.description)}';`
        : "",
      afterScript: "",
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
        identiferCase: "original",
        includeSchema: "always",
        quotation: "if_needed",
        includeGeneratedNames: "always"
      },
      embeddedInParentsIsDisplayed: true,
      schemaContainerIsDisplayed: false,
      estimatedSizeIsDisplayed: false,
      nameAutoGeneration: {
        keys: true,
        indexes: true,
        relations: true
      },
      writeFileParam: false,
      currentDisplayMode: "metadata"
    };
  }
}
