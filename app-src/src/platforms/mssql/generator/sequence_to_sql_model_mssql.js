import { ObjectToSQLModel } from "../../../generator/model-to-sql-model/object_to_sql_model";
import _ from "lodash";

export class SequenceToSQLModelMSSQL extends ObjectToSQLModel {
  startWith(sequenceDetails) {
    return this.sb.block(
      this.sb.keyword(`START`),
      this.sb.keyword(`WITH`),
      this.sb.code(sequenceDetails.start)
    );
  }

  incrementBy(sequenceDetails) {
    return this.sb.block(
      this.sb.keyword(`INCREMENT`),
      this.sb.keyword(`BY`),
      this.sb.code(sequenceDetails.increment)
    );
  }

  min(sequenceDetails) {
    return sequenceDetails.minValue
      ? this.sb.block(
          this.sb.keyword(`MINVALUE`),
          this.sb.code(sequenceDetails.minValue)
        )
      : undefined;
  }

  max(sequenceDetails) {
    return sequenceDetails.maxValue
      ? this.sb.block(
          this.sb.keyword(`MAXVALUE`),
          this.sb.code(sequenceDetails.maxValue)
        )
      : undefined;
  }

  cache(sequenceDetails) {
    return sequenceDetails.cache
      ? this.sb.block(
          this.sb.keyword(`CACHE`),
          this.sb.code(sequenceDetails.cache)
        )
      : undefined;
  }

  isCycling(sequenceDetails) {
    return sequenceDetails.isCycling ? [this.sb.keyword(`CYCLE`)] : [];
  }

  comment() {
    const comment = this.obj.desc;
    const schema = this.obj.mssql?.schema;
    if (!_.isEmpty(comment) && !_.isEmpty(schema)) {
      return this.sb.statement(
        this.sb.code(`EXEC sys.sp_addextendedproperty`),
        this.sb.block(
          this.sb.code(`'MS_Description',`),
          this.sb.code(`N'${comment.replaceAll("'", "''")}',`),
          this.sb.code(`'schema', N'${schema}',`),
          this.sb.code(`'sequence', N'${this.obj.name}';`)
        ),
        this.sb.statementDelimiterNewLine()
      );
    }
    return undefined;
  }

  objectStatements() {
    const sequenceDetails = this.obj.mssql?.sequence;
    if (!sequenceDetails) {
      return undefined;
    }
    return [
      this.sb.statement(
        //
        this.sb.block(this.sb.keyword(`CREATE`), this.sb.keyword(`SEQUENCE`)),
        this.sb.block(
          //
          this.sb.qualifiedIdentifier(this.obj)
        ),
        this.sb.block(
          this.startWith(sequenceDetails),
          this.incrementBy(sequenceDetails),
          this.min(sequenceDetails),
          this.max(sequenceDetails),
          this.cache(sequenceDetails),
          ...this.isCycling(sequenceDetails)
        ),
        this.sb.code(`;`),
        this.sb.statementDelimiterNewLine()
      ),
      this.comment()
    ];
  }
}
