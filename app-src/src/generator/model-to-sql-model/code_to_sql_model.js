import { ObjectToSQLModel } from "./object_to_sql_model";
import { OtherObjectTypes } from "common";
import _ from "lodash";

export class CodeToSQLModel extends ObjectToSQLModel {
  objectStatements() {
    return !_.isEmpty(this.obj.code)
      ? [
          this.sb.statement(
            //
            ...this.startRoutineDelimiter(),
            this.sb.code(this.obj.code),
            ...this.endRoutineDelimiter(),
            this.statementDelimiter()
          )
        ]
      : [];
  }

  statementDelimiter() {
    return undefined;
  }

  startRoutineDelimiter() {
    return this.generatorOptions.useRoutineDelimiter === true &&
      this.isRoutine() === true
      ? [this.sb.statementDelimiterDefine(true)]
      : [];
  }

  endRoutineDelimiter() {
    return this.generatorOptions.useRoutineDelimiter === true &&
      this.isRoutine() === true
      ? [
          this.sb.statementDelimiter(true),
          this.sb.statementDelimiterDefine(false)
        ]
      : [];
  }

  isRoutine() {
    return (
      this.obj.type === OtherObjectTypes.Function ||
      this.obj.type === OtherObjectTypes.Procedure
    );
  }
}
