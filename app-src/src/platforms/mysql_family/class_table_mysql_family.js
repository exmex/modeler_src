import { ClassTable } from "../../classes/class_table";

export class ClassTableMySQLFamily extends ClassTable {
  constructor(id, name, cols, keys, embeddable, defaultValues) {
    super(id, name, cols, keys, embeddable);
    this.tabletype = defaultValues.def_tabletype;
    this.collation = defaultValues.def_collation;
    this.charset = defaultValues.def_charset;
    this.rowformat = defaultValues.def_rowformat;
    this.database = defaultValues.def_database;
  }
}
