import { ScopeAnalyzer } from "../../../generator/scope_analyzer";

export class ScopeAnalyzerSQLite extends ScopeAnalyzer {
  existsScopes(obj) {
    return false;
  }

  scopeIdentifer(obj) {
    return undefined;
  }

  objectIdentifier(obj) {
    return obj.name;
  }
}
