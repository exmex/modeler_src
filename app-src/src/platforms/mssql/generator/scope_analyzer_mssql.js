import { ScopeAnalyzer } from "../../../generator/scope_analyzer";

export class ScopeAnalyzerMSSQL extends ScopeAnalyzer {
  existsScopes(obj) {
    return !!(obj.mssql && obj.mssql.schema);
  }

  scopeIdentifer(obj) {
    return obj.mssql && obj.mssql.schema;
  }

  objectIdentifier(obj) {
    return obj.name;
  }
}
