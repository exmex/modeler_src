const KEYWORDS = [`ABORT`,
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
    `WITHOUT`];


export class SQLiteQuotation {
    public quoteIdentifier(identifier: string): string {
        if (KEYWORDS.filter((keyword) => keyword === identifier.toUpperCase()).length > 0) {
            return `"${identifier}"`;
        }
        const plainIdentifier = identifier.match(/^([^\x00-\x7F]|[\w])+$/g);
        return plainIdentifier
            ? this.quoteIdentifierIfNeeded(identifier)
            : this.quoteIdentifer(identifier);
    }

    private quoteIdentifer(identifier: string): string {
        return `"${identifier}"`;
    }

    private quoteIdentifierIfNeeded(identifier: string): string {
        return ((this.containsUpperChar(identifier))
            ? this.quoteIdentifer(identifier)
            : identifier
        );
    }

    private isUpper(character: string): boolean {
        return (character !== character.toLowerCase()) && (character === character.toUpperCase());
    }

    private containsUpperChar(string: string): boolean {
        for (let char of string) {
            if (this.isUpper(char)) {
                return true;
            }
        }
        return false;
    }
}