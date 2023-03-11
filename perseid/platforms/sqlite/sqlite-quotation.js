import { Quotation } from "../../generator/quotation";

const KEYWORDS = [
  `ABORT`,
  `ACTION`,
  `ADD`,
  `AFTER`,
  `ALL`,
  `ALTER`,
  `ALWAYS`,
  `ANALYZE`,
  `AND`,
  `AS`,
  `ASC`,
  `ATTACH`,
  `AUTOINCREMENT`,
  `BEFORE`,
  `BEGIN`,
  `BETWEEN`,
  `BY`,
  `CASCADE`,
  `CASE`,
  `CAST`,
  `CHECK`,
  `COLLATE`,
  `COLUMN`,
  `COMMIT`,
  `CONFLICT`,
  `CONSTRAINT`,
  `CREATE`,
  `CROSS`,
  `CURRENT`,
  `CURRENT_DATE`,
  `CURRENT_TIME`,
  `CURRENT_TIMESTAMP`,
  `DATABASE`,
  `DEFAULT`,
  `DEFERRABLE`,
  `DEFERRED`,
  `DELETE`,
  `DESC`,
  `DETACH`,
  `DISTINCT`,
  `DO`,
  `DROP`,
  `EACH`,
  `ELSE`,
  `END`,
  `ESCAPE`,
  `EXCEPT`,
  `EXCLUDE`,
  `EXCLUSIVE`,
  `EXISTS`,
  `EXPLAIN`,
  `FAIL`,
  `FILTER`,
  `FIRST`,
  `FOLLOWING`,
  `FOR`,
  `FOREIGN`,
  `FROM`,
  `FULL`,
  `GENERATED`,
  `GLOB`,
  `GROUP`,
  `GROUPS`,
  `HAVING`,
  `IF`,
  `IGNORE`,
  `IMMEDIATE`,
  `IN`,
  `INDEX`,
  `INDEXED`,
  `INITIALLY`,
  `INNER`,
  `INSERT`,
  `INSTEAD`,
  `INTERSECT`,
  `INTO`,
  `IS`,
  `ISNULL`,
  `JOIN`,
  `KEY`,
  `LAST`,
  `LEFT`,
  `LIKE`,
  `LIMIT`,
  `MATCH`,
  `NATURAL`,
  `NO`,
  `NOT`,
  `NOTHING`,
  `NOTNULL`,
  `NULL`,
  `NULLS`,
  `OF`,
  `OFFSET`,
  `ON`,
  `OR`,
  `ORDER`,
  `OTHERS`,
  `OUTER`,
  `OVER`,
  `PARTITION`,
  `PLAN`,
  `PRAGMA`,
  `PRECEDING`,
  `PRIMARY`,
  `QUERY`,
  `RAISE`,
  `RANGE`,
  `RECURSIVE`,
  `REFERENCES`,
  `REGEXP`,
  `REINDEX`,
  `RELEASE`,
  `RENAME`,
  `REPLACE`,
  `RESTRICT`,
  `RIGHT`,
  `ROLLBACK`,
  `ROW`,
  `ROWS`,
  `SAVEPOINT`,
  `SELECT`,
  `SET`,
  `TABLE`,
  `TEMP`,
  `TEMPORARY`,
  `THEN`,
  `TIES`,
  `TO`,
  `TRANSACTION`,
  `TRIGGER`,
  `UNBOUNDED`,
  `UNION`,
  `UNIQUE`,
  `UPDATE`,
  `USING`,
  `VACUUM`,
  `VALUES`,
  `VIEW`,
  `VIRTUAL`,
  `WHEN`,
  `WHERE`,
  `WINDOW`,
  `WITH`,
  `WITHOUT`
];

export class SQLiteQuotation extends Quotation {
  quoteIdentifier(identifier, forceQuotation) {
    if (
      forceQuotation === true ||
      KEYWORDS.filter(keyword => keyword === identifier.toUpperCase()).length >
        0
    ) {
      return `"${identifier}"`;
    }
    // eslint-disable-next-line
    const plainIdentifier = identifier.match(/^([^\x00-\x7F]|[\w])+$/g);
    return plainIdentifier
      ? this.containsUpperChar(identifier)
        ? `"${identifier}"`
        : identifier
      : `"${identifier}"`;
  }

  isUpper(character) {
    return (
      character !== character.toLowerCase() &&
      character === character.toUpperCase()
    );
  }

  containsUpperChar(string) {
    for (let i = 0; i < string.length; i++) {
      if (this.isUpper(string[i])) {
        return true;
      }
    }
    return false;
  }

  quoteComment(comment) {
    const lineBreakedIndex = comment && comment.indexOf(`\n`);
    return lineBreakedIndex && lineBreakedIndex > 0
      ? `/* ${comment} */`
      : `/* ${comment} */`;
  }

  quoteLiteral(literal) {
    return `'${literal ? literal.replace(/'/g, "''") : ""}'`;
  }
}
