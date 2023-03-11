import { BracketType } from "../../../generator/model-to-sql-model/sql_model_builder";
import { ObjectToSQLModel } from "../../../generator/model-to-sql-model/object_to_sql_model";
import _ from "lodash";

export class UserDefinedTypeToSQLModelMSSQL extends ObjectToSQLModel {
  from(udtDetails) {
    return this.sb.block(
      this.sb.keyword(`FROM`),
      this.sb.code(udtDetails.baseType),
      udtDetails.params
        ? this.sb.brackets(
          this.sb.code(udtDetails.params),
          true,
          BracketType.ROUND
        )
        : undefined,
      udtDetails.isNotNull
        ? this.sb.block(this.sb.keyword(`NOT`), this.sb.keyword(`NULL`))
        : this.sb.keyword(`NULL`)
    );
  }

  externalName(udtDetails) {
    return !_.isEmpty(udtDetails.externalName)
      ? this.sb.block(
        this.sb.keyword(`EXTERNAL`),
        this.sb.keyword(`NAME`),
        this.sb.code(udtDetails.externalName)
      )
      : undefined;
  }

  asTable(udtDetails) {
    return !_.isEmpty(udtDetails.asTable)
      ? this.sb.block(this.sb.keyword(`AS`), this.sb.code(udtDetails.asTable))
      : undefined;
  }

  comment() {
    const comment = this.obj.desc;
    const schema = this.obj.mssql?.schema;
    if (!_.isEmpty(comment) && !_.isEmpty(schema)) {
      return this.sb.statement(
        this.sb.code(`EXEC sys.sp_addextendedproperty`),
        this.sb.statement(
          this.sb.code(`'MS_Description',`),
          this.sb.code(`N'${comment.replaceAll("'", "''")}',`),
          this.sb.code(`'schema', N'${schema}',`),
          this.sb.code(`'type', N'${this.obj.name}';`)
        ),
        this.sb.statementDelimiterNewLine()
      );
    }
    return undefined;
  }

  objectStatements() {
    const userDefinedTypeDetails = this.obj.mssql?.udt;
    if (!userDefinedTypeDetails) {
      return undefined;
    }
    return [
      this.sb.statement(
        //
        this.sb.block(this.sb.keyword(`CREATE`), this.sb.keyword(`TYPE`)),
        this.sb.block(
          //
          this.sb.qualifiedIdentifier(this.obj)
        ),
        this.sb.block(
          this.from(userDefinedTypeDetails),
          this.externalName(userDefinedTypeDetails),
          this.asTable(userDefinedTypeDetails)
        ),
        this.sb.statementDelimiterNewLine()
      ),
      this.comment()
    ];
  }
}
