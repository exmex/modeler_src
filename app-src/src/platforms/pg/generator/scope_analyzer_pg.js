import { ScopeAnalyzer } from "../../../generator/scope_analyzer";

export class ScopeAnalyzerPG extends ScopeAnalyzer {
  existsScopes(obj) {
    return !!(obj.pg && obj.pg.schema);
  }

  scopeIdentifer(obj) {
    return obj.pg && obj.pg.schema;
  }

  objectIdentifier(obj) {
    return obj.name;
  }
}
