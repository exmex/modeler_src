import {
  KnownIdRegistry,
  ModelPartProvider,
  NamesRegistry,
  Platform,
  ReverseOptions
} from "re";
import { ModelDescription, getAppVersionObject } from "common";

import { MSSQLQuotation } from "../../../../db/mssql/mssql-quotation";
import { MSSQLSchemasRE } from "../../re/MSSQLSchemasRE";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";

export class MSSQLModelDescriptionProvider
  implements ModelPartProvider<ModelDescription>
{
  public constructor(
    private reverseOptions: ReverseOptions,
    private schemasRE: MSSQLSchemasRE,
    private quotation: MSSQLQuotation,
    private namesRegistry: NamesRegistry,
    private knownIdRegistry: KnownIdRegistry
  ) {}
  public async provide(): Promise<ModelDescription> {
    const diagram = this.namesRegistry.diagrams.find(() => true);
    const originalModelDescription = this.knownIdRegistry.getModelDescription();

    const schemasMetadata = await this.schemasRE.reverse();
    const beforeScript = _.reduce(
      schemasMetadata,
      (r, schemaMetadata) => {
        const schemaIdentifier = this.quotation.quoteIdentifier(
          schemaMetadata.name,
          false
        );
        const schemaCreateDDL = `CREATE SCHEMA ${schemaIdentifier};\nGO\n\n`;
        const schemaComment = schemaMetadata?.description
          ? `EXEC sys.sp_addextendedproperty 'MS_Description', N'${schemaMetadata.description.replace(
              new RegExp(/'/, "g"),
              "''"
            )}', 'schema', N'${schemaMetadata.name}';\nGO\n`
          : ``;
        return `${r}${schemaCreateDDL}${schemaComment}\n`;
      },
      ""
    );

    if (!!originalModelDescription) {
      return {
        ...originalModelDescription,
        connectionId: this.reverseOptions.connectionId,
        storedin: getAppVersionObject(process.env.CURRENT_PRODUCT),
        mssql: {
          schema: ``
        },
        beforeScript
      };
    }

    return {
      connectionId: this.reverseOptions.connectionId,
      activeDiagram: diagram ? diagram.id : uuidv4(),
      caseConvention: "under",
      color: "transparent",
      def_charset: "",
      def_collation: "",
      def_coltopk: true,
      def_rowformat: "na",
      def_tabletype: "na",
      desc: "",
      id: uuidv4(),
      isDirty: true,
      name: this.reverseOptions.connectionName,
      parentTableInFkCols: true,
      path: "",
      replaceSpace: "_",
      sideSelections: true,
      storedin: getAppVersionObject(process.env.CURRENT_PRODUCT),
      type: Platform.MSSQL,
      version: 1,
      def_others: "",
      filePath: "",
      lastSaved: "",
      cardinalityIsDisplayed: false,
      mssql: {
        schema: ``
      },
      beforeScript,
      afterScript: "",
      sqlSettings: {
        wrapLines: true,
        wrapOffset: 80,
        indent: true,
        indentationString: "spaces",
        indentationSize: 2,
        limitItemsOnLine: true,
        maxListItemsOnLine: 3,
        statementDelimiter: "GO",
        routineDelimiter: ";",
        keywordCase: "upper",
        identiferCase: "original",
        includeSchema: "always",
        quotation: "if_needed",
        includeGeneratedNames: "always",
        quotationType: "square_brackets"
      },
      embeddedInParentsIsDisplayed: true,
      schemaContainerIsDisplayed: true,
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
