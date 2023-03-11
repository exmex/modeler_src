import { ScopeAnalyzer } from "../../../generator/scope_analyzer";

export class ScopeAnalyzerMySQLFamily extends ScopeAnalyzer {
  existsScopes(obj) {
    return !!obj.database;
  }

  scopeIdentifer(obj) {
    return obj.database;
  }

  objectIdentifier(obj) {
    return obj.name;
  }
}
