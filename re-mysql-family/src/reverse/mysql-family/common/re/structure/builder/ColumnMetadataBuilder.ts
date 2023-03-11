import { CommonColumnMetadata, KnownIdRegistry } from "re";

import { MySQLFamilyFeatures } from "../../../MySQLFamilyFeatures";
import { ParameterSeparator } from "../ParameterSeparator";
import { Platform } from "re";
import { TableMetadata } from "../../../metadata/TableMetadata";
import { v4 as uuidv4 } from "uuid";

export interface ColumnMetadataRow {
  TABLE_NAME: string;
  COLUMN_NAME: string;
  DATA_TYPE: string;
  IS_NULLABLE: string;
  COLUMN_COMMENT: string;
  COLUMN_DEFAULT: string;
  COLUMN_TYPE: string;
  GENERATION_EXPRESSION: string;
  COLLATION_NAME: string;
  CHARACTER_SET_NAME: string;
  EXTRA: string;
}

export class ColumnMetadataBuilder {
  constructor(
    private features: MySQLFamilyFeatures,
    private knownIdRegistry: KnownIdRegistry
  ) {}

  public transform(
    result: ColumnMetadataRow[],
    tablesMetadata: Map<string, TableMetadata>
  ): void {
    result.forEach((row: ColumnMetadataRow): void => {
      const tableMetadata = tablesMetadata.get(row.TABLE_NAME) as TableMetadata;

      if (tableMetadata) {
        const name = row.COLUMN_NAME;
        const originalTableColumn = this.knownIdRegistry.getTableColumn(
          tableMetadata.database,
          tableMetadata.name,
          undefined,
          name
        );
        const id = originalTableColumn?.id ?? uuidv4();
        const dt = row.DATA_TYPE.toUpperCase();
        const params = ParameterSeparator.separateParameter(row.COLUMN_TYPE);
        const columnMetadata: CommonColumnMetadata = {
          id,
          name,
          datatype: dt,
          param: !this.isEnumSet(row.DATA_TYPE) ? params : "",
          pk: false,
          nn: row.IS_NULLABLE !== "YES",
          comment: row.COLUMN_COMMENT,
          defaultvalue: this.isEmptyValue(row.COLUMN_DEFAULT)
            ? ""
            : this.quoteDefaultValue(
                row.COLUMN_DEFAULT,
                dt,
                row.EXTRA.includes("DEFAULT_GENERATED")
              ),
          unsigned: row.COLUMN_TYPE.indexOf("unsigned") > -1,
          zerofill: row.COLUMN_TYPE.indexOf("zerofill") > -1,
          after: this.generateAfterScript(row.EXTRA, row.GENERATION_EXPRESSION),
          enumSet: this.isEnumSet(row.DATA_TYPE) ? params : "",
          collation: row.COLLATION_NAME,
          charset: row.CHARACTER_SET_NAME,
          autoinc: row.EXTRA === "auto_increment",
          json: dt === "JSON",
          list: false,
          data: originalTableColumn?.data ?? "",
          estimatedSize: originalTableColumn?.estimatedSize ?? ""
        };
        tableMetadata.columns.push(columnMetadata);
      }
    });
  }

  private isEmptyValue(value: string) {
    return value === undefined || value === null || value === "";
  }

  private isStringValue(dataType: string): boolean {
    return (
      this.isEnumSet(dataType) ||
      dataType === "CHAR" ||
      dataType === "VARCHAR" ||
      dataType === "BINARY" ||
      dataType === "VARBINARY" ||
      dataType === "BLOB" ||
      dataType === "TEXT" ||
      dataType === "ENUM" ||
      dataType === "SET"
    );
  }

  private isDateValue(dataType: string): boolean {
    return (
      dataType === "DATE" ||
      dataType === "TIME" ||
      dataType === "DATETIME" ||
      dataType === "TIMESTAMP" ||
      dataType === "YEAR"
    );
  }

  private isLiteralDate(value: string): boolean {
    return !!value.match(/[0-9]/);
  }

  private isQuoted(value: string): boolean {
    return (
      !!value &&
      value.length >= 2 &&
      value[0] === "'" &&
      value[value.length - 1] === "'"
    );
  }

  private isEncodingDefined(value: string): boolean {
    return !!value.match(/(_[a-zA-Z0-9]+)(\\\'.*\\\')/);
  }

  private quoteDefaultValue(
    defaultValue: string,
    dataType: string,
    isGenerated: boolean
  ) {
    if (
      this.features.modelType() === Platform.MARIADB &&
      this.features.expressionQuotedDefault()
    ) {
      return defaultValue;
    }

    if (this.isStringValue(dataType) && this.isEncodingDefined(defaultValue)) {
      return defaultValue.replace(/\\'/g, "'").replace(/\\\\/, "\\");
    }

    if (this.features.expressionGeneratedExtraDefault()) {
      if (isGenerated) {
        return defaultValue;
      } else {
        if (this.isStringValue(dataType)) {
          return `'${defaultValue}'`;
        }
        if (this.isDateValue(dataType)) {
          return `'${defaultValue}'`;
        }
      }
    }

    if (this.isStringValue(dataType) && !this.isQuoted(defaultValue)) {
      return `'${defaultValue}'`;
    }

    if (
      this.isDateValue(dataType) &&
      this.isLiteralDate(defaultValue) &&
      !this.isQuoted(defaultValue)
    ) {
      return `'${defaultValue}'`;
    }

    return defaultValue;
  }

  private generateAfterScript(
    extra: string,
    generationExpression: string
  ): string {
    if (this.features.generatedColumnExtraBrackets()) {
      switch (extra) {
        case "VIRTUAL GENERATED":
          return ` AS ${generationExpression} VIRTUAL`;
        case "STORED GENERATED":
          return ` AS (${generationExpression}) STORED`;
        default:
          return "";
      }
    }
    switch (extra) {
      case "VIRTUAL GENERATED":
        return ` AS (${generationExpression}) VIRTUAL`;
      case "STORED GENERATED":
        return ` AS (${generationExpression}) STORED`;
      default:
        return "";
    }
  }

  private isEnumSet(dataType: string): boolean {
    switch (dataType) {
      case "enum":
      case "set":
        return true;
      default:
        return false;
    }
  }
}
