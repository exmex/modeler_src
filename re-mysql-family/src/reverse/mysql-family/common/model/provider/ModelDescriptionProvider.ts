import {
  KnownIdRegistry,
  ModelPartProvider,
  NamesRegistry,
  ReverseOptions
} from "re";
import { ModelDescription, getAppVersionObject } from "common";

import { MySQLFamilyFeatures } from "../../MySQLFamilyFeatures";
import { MySQLFamilySchemaRE } from "../../re/structure/MariaDBSchemaRE";
import { v4 as uuidv4 } from "uuid";

export class ModelDescriptionProvider
  implements ModelPartProvider<ModelDescription>
{
  public constructor(
    private features: MySQLFamilyFeatures,
    private reverseOptions: ReverseOptions,
    private schemaRE: MySQLFamilySchemaRE,
    private namesRegistry: NamesRegistry,
    private knownIdRegistry: KnownIdRegistry
  ) {}

  private getQuotedComment(comment: string): string {
    return comment ? comment.replace(/'/g, "''") : "";
  }

  public async provide(): Promise<ModelDescription> {
    const schema = await this.schemaRE.reverse();
    const activeDiagram = this.namesRegistry.diagrams.find(() => true);

    const originalModelDescription = this.knownIdRegistry.getModelDescription();
    if (!!originalModelDescription) {
      return {
        ...originalModelDescription,
        connectionId: this.reverseOptions.connectionId,
        storedin: getAppVersionObject(process.env.CURRENT_PRODUCT),
        beforeScript:
          schema && schema.description
            ? `ALTER SCHEMA \`${
                schema.def_database
              }\` COMMENT '${this.getQuotedComment(schema.description)}';`
            : ""
      };
    }

    return {
      connectionId: this.reverseOptions.connectionId,
      color: "transparent",
      activeDiagram: activeDiagram ? activeDiagram.id : uuidv4(),
      caseConvention: "under",
      def_charset: schema ? schema.def_charset : "",
      def_collation: schema ? schema.def_collation : "",
      def_coltopk: true,
      def_rowformat: "na",
      def_tabletype: "",
      def_database: schema ? schema.def_database : "",
      def_others: "",
      desc: schema ? schema.description : "",
      id: uuidv4(),
      isDirty: true,
      name: this.reverseOptions.connectionName,
      parentTableInFkCols: true,
      path: "",
      replaceSpace: "_",
      sideSelections: true,
      storedin: getAppVersionObject(process.env.CURRENT_PRODUCT),
      type: this.features.modelType(),
      version: 1,
      filePath: "",
      lastSaved: "",
      beforeScript:
        schema && schema.description
          ? `ALTER SCHEMA \`${
              schema.def_database
            }\` COMMENT '${this.getQuotedComment(schema.description)}';`
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
        routineDelimiter: "//",
        keywordCase: "upper",
        identiferCase: "original",
        includeSchema: "always",
        quotation: "if_needed"
      },
      embeddedInParentsIsDisplayed: true,
      schemaContainerIsDisplayed: false,
      cardinalityIsDisplayed: false,
      estimatedSizeIsDisplayed: false,
      writeFileParam: false,
      currentDisplayMode: "metadata"
    };
  }
}
