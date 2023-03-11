import { ScopeType } from "./sql_model_builder";
import { ToSQLModel } from "./to_sql_model";
import _ from "lodash";

export class ObjectToSQLModel extends ToSQLModel {
  constructor(sqlModelBuilder, finder, generatorOptions, obj) {
    super(sqlModelBuilder, finder, generatorOptions);
    this.obj = obj;
  }

  getModelObject() {
    return { generate: false, generateCustomCode: false, ...this.obj };
  }

  objectStatements() {
    return [];
  }

  convert() {
    const m = this.sb.statements(
      ...(this.getModelObject().generate === true ||
      this.generatorOptions.previewObject === true
        ? this.objectStatements()
        : []),
      ...(this.getModelObject().generateCustomCode === true &&
      this.generatorOptions.previewObject === false &&
      !_.isEmpty(this.getModelObject().customCode)
        ? [
            this.sb.statement(
              //
              this.sb.code(this.getModelObject().customCode),
              this.sb.statementDelimiterNewLine()
            )
          ]
        : [])
    );
    return m;
  }

  parameter(keywords, value, isIdentifier, isCode) {
    const parameter =
      isIdentifier === true
        ? this.sb.identifier(value, true, ScopeType.SUBOBJECT)
        : isCode
        ? this.sb.code(value)
        : this.sb.literal(value);

    return value
      ? [...keywords.map((keyword) => this.sb.keyword(keyword)), parameter]
      : [];
  }
}
