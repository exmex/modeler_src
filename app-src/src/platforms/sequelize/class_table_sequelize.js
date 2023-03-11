import { ClassTable } from "../../classes/class_table";

export class ClassTableSequelize extends ClassTable {
  constructor(id, name, cols, keys, embeddable, defaultValues) {
    super(id, name, cols, keys, embeddable);
    this.freezeTableName = defaultValues.def_freezeTableName;
    this.timestamps = defaultValues.def_timestamps;
    this.tabletype = defaultValues.def_tabletype || "na";
    this.paranoid = defaultValues.def_paranoid;
    this.version = defaultValues.def_version;
    this.collation = defaultValues.def_collation;
    this.charset = defaultValues.def_charset;
    this.underscored = defaultValues.underscored;
  }
}
