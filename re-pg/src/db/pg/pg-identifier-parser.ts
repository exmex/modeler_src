import { ScopedIdentifier } from "../../reverse/pg/PgUserDataTypeRegistry";

export class PgIdentifierParser {
    parseIdentifier(datatypeIdentifier: string, defaultScope: string | undefined): ScopedIdentifier {
        const schema_quoted = datatypeIdentifier.match(/(^"[^"]*"\.)/g)
        const schema_unquoted = datatypeIdentifier.match(/^[^"][^\.]*\./g);
        const name_quoted = datatypeIdentifier.match(/"[^"]*"$/g);
        const name_unquoted = datatypeIdentifier.match(/[^\.]*[^"]$/g);



        let scope: string | undefined = "";
        let name: string | undefined = "";
        if (schema_quoted && schema_quoted.length === 1) {
            scope = schema_quoted[0].substring(1, schema_quoted[0].length - 2)
        } else
            if (schema_unquoted && schema_unquoted.length === 1) {
                const schema_quoted_qroup = schema_unquoted[0];
                scope = schema_quoted_qroup.substring(0, schema_quoted_qroup.length - 1)
            } else {
                scope = defaultScope;
            }

        if (name_quoted && name_quoted.length === 1) {
            name = name_quoted[0].substring(1, name_quoted[0].length - 1)
        } else if (name_unquoted && name_unquoted.length === 1) {
            name = name_unquoted[0];
        } else {
            throw new Error("Wrong Identifier");
        }
        if (scope) {
            return { scope, name }
        } else {
            return { name };
        }
    }
}