import { ScopeType } from "./sql_model_builder";
import { ToSQLModel } from "./to_sql_model";

export class ObjectToSQLModel extends ToSQLModel {
  constructor(sqlModelBuilder, finder, generatorOptions, obj) {
    super(sqlModelBuilder, finder, generatorOptions);
    this.obj = obj;
  }

  get modelObject() {
    return { generate: false, generateCustomCode: false, ...this.obj };
  }

  objectStatements() {
    return [];
  }

  convert() {
    return this.sb.statements(
      ...(this.modelObject.generate === true ||
      this.generatorOptions.previewObject === true
        ? this.objectStatements()
        : []),
      ...(this.modelObject.generateCustomCode === true &&
      this.generatorOptions.previewObject === false
        ? [
            this.sb.statement(
              //
              this.sb.code(this.modelObject.customCode)
            )
          ]
        : [])
    );
  }

  parameter(keywords, value, identifier) {
    const parameter =
      identifier === true
        ? this.sb.identifier(value, true, ScopeType.SUBOBJECT)
        : this.sb.literal(value);

    return value
      ? [...keywords.map(keyword => this.sb.keyword(keyword)), parameter]
      : [];
  }
}
