import { ObjectToSQLModel } from "./object_to_sql_model";
import { OtherObjectTypes } from "../../classes/class_other_object";

export class CodeToSQLModel extends ObjectToSQLModel {
  objectStatements() {
    return [
      this.sb.statement(
        //
        ...this.startRoutineDelimiter(),
        this.sb.code(this.obj.code),
        ...this.endRoutineDelimiter()
      )
    ];
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
