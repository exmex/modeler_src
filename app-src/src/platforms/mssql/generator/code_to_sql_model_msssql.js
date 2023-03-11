import { CodeToSQLModel } from "../../../generator/model-to-sql-model/code_to_sql_model";

export class CodeToSQLModelMSSQL extends CodeToSQLModel {
  statementDelimiter() {
    return this.sb.statementDelimiterNewLine();
  }
}
