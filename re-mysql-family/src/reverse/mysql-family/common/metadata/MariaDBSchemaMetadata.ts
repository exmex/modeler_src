import { CommonSchemaMetadata } from "re";

export class MySQLFamilySchemaMetadata extends CommonSchemaMetadata {
    public constructor(name: string, description: string,
        public def_collation: string,
        public def_charset: string,
        public def_database: string
    ) { super(name, description); }

}
