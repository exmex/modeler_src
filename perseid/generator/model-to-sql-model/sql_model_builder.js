export const TokenType = {
  EMPTY: "empty",
  STATEMENT: "statement",
  STATEMENTS: "statements",
  STATEMENT_DELIMITER: "statementDelimiter",
  STATEMENT_DELIMITER_DEFINE: "statementDelimiterDefine",
  ROUTINE_DELIMITER_DEFINE: "routineDelimiterDefine",
  ROUTINE_DELIMITER: "routineDelimiter",
  LITERAL: "literal",
  QUOTED_LITERAL: "quotedLiteral",
  KEYWORD: "keyword",
  IDENTIFIER: "identifier",
  QUALIFIED_IDENTIFIER: "qualifiedIdentifier",
  BLOCK: "block",
  LIST: "list",
  BRACKETS: "brackets",
  CODE: "code",
  COMMENT: "comment"
};

export const BracketType = {
  SQUARE: "square",
  ROUND: "round"
};

export const ScopeType = {
  // schema, database
  CONTAINER: "container",
  // table, domain
  OBJECT: "object",
  // column, index
  SUBOBJECT: "subobject"
};

export class SQLModelBuilder {
  constructor(scopeAnalyzer) {
    this.scopeAnalyzer = scopeAnalyzer;
  }

  multiItems(type, ...items) {
    const nestedItems = items.filter(
      item => !!item && !(Array.isArray(item) && item.length === 0)
    );
    if (nestedItems.length === 0) {
      return undefined;
    }
    return {
      type,
      nestedItems
    };
  }

  block(...items) {
    return this.multiItems(TokenType.BLOCK, ...items);
  }

  list(...items) {
    return this.multiItems(TokenType.LIST, ...items);
  }

  statement(...items) {
    return this.multiItems(TokenType.STATEMENT, ...items);
  }

  statements(...items) {
    return this.multiItems(TokenType.STATEMENTS, ...items);
  }

  statementDelimiter(isRoutine) {
    return {
      type: TokenType.STATEMENT_DELIMITER,
      isRoutine,
      adherent: true
    };
  }

  statementDelimiterDefine(isRoutine) {
    return {
      type: TokenType.STATEMENT_DELIMITER_DEFINE,
      isRoutine,
      adherent: true
    };
  }

  keyword(value) {
    if (this.isEmptyOrUndefinedString(value)) {
      return undefined;
    }
    return {
      type: TokenType.KEYWORD,
      value
    };
  }

  literal(value) {
    if (this.isEmptyOrUndefinedString(value)) {
      return undefined;
    }
    return {
      type: TokenType.LITERAL,
      value
    };
  }

  identifier(value, forceQuotation, scopeType) {
    if (value === undefined) {
      return undefined;
    }
    return {
      type: TokenType.IDENTIFIER,
      value,
      forceQuotation,
      scopeType
    };
  }

  code(value) {
    if (this.isEmptyOrUndefinedString(value)) {
      return undefined;
    }
    return {
      type: TokenType.CODE,
      value
    };
  }

  comment(value) {
    if (this.isEmptyOrUndefinedString(value)) {
      return undefined;
    }
    return {
      type: TokenType.COMMENT,
      value
    };
  }

  quotedLiteral(value) {
    if (this.isEmptyOrUndefinedString(value)) {
      return undefined;
    }
    return {
      type: TokenType.QUOTED_LITERAL,
      value
    };
  }

  isEmptyOrUndefinedString(value) {
    return value === undefined || value === "";
  }

  qualifiedIdentifier(obj) {
    const schemaIdentifier =
      this.scopeAnalyzer.existsScopes(obj) === true
        ? this.identifier(
            this.scopeAnalyzer.scopeIdentifer(obj),
            false,
            ScopeType.CONTAINER
          )
        : undefined;
    const objectIdentifier = this.identifier(
      this.scopeAnalyzer.objectIdentifier(obj),
      false,
      ScopeType.OBJECT
    );
    return {
      type: TokenType.QUALIFIED_IDENTIFIER,
      nestedItems: [schemaIdentifier, objectIdentifier].filter(
        identifier => !!identifier
      )
    };
  }

  qualifiedIdentifierInner(obj, innerObj) {
    const schemaIdentifier =
      this.scopeAnalyzer.existsScopes(obj) === true
        ? this.identifier(
            this.scopeAnalyzer.scopeIdentifer(obj),
            false,
            ScopeType.CONTAINER
          )
        : undefined;
    const objectIdentifier = this.identifier(
      this.scopeAnalyzer.objectIdentifier(obj),
      false,
      ScopeType.OBJECT
    );
    const innerIdentifier = this.identifier(
      innerObj.name,
      false,
      ScopeType.SUBOBJECT
    );
    return {
      type: TokenType.QUALIFIED_IDENTIFIER,
      nestedItems: [schemaIdentifier, objectIdentifier, innerIdentifier].filter(
        identifier => !!identifier
      )
    };
  }

  brackets(item, adherent, bracketType) {
    if (item === undefined) {
      return undefined;
    }
    return {
      type: TokenType.BRACKETS,
      nestedItem: item,
      adherent,
      bracketType
    };
  }

  empty() {
    return {
      type: TokenType.EMPTY
    };
  }
}
