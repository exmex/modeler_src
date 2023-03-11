import { BracketType } from "../../../generator/model-to-sql-model/sql_model_builder";
import { CodeToSQLModel } from "../../../generator/model-to-sql-model/code_to_sql_model";

/**
 * Convert model to SQL model
 * CREATE TYPE AS ENUM
 */
export class EnumToSQLModelPG extends CodeToSQLModel {
  objectStatements() {
    return [
      this.sb.statement(
        this.sb.keyword(`CREATE`),
        this.sb.keyword(`TYPE`),
        this.sb.qualifiedIdentifier(this.obj),
        this.sb.keyword(`AS`),
        this.sb.keyword(`ENUM`),
        this.sb.brackets(
          this.sb.code(this.obj.enumValues),
          true,
          BracketType.ROUND
        ),
        this.sb.statementDelimiter(false)
      ),
      this.commentStatement(
        `TYPE`,
        this.sb.qualifiedIdentifier(this.obj),
        this.obj.desc
      )
    ];
  }

  commentStatement(type, qualifiedIdentifier, comment) {
    return this.obj.desc
      ? this.sb.statement(
          this.sb.keyword(`COMMENT`),
          this.sb.keyword(`ON`),
          this.sb.keyword(type),
          qualifiedIdentifier,
          this.sb.keyword(`IS`),
          this.sb.quotedLiteral(comment),
          this.sb.statementDelimiter(false)
        )
      : undefined;
  }
}
