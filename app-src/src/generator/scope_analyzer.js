export class ScopeAnalyzer {
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
