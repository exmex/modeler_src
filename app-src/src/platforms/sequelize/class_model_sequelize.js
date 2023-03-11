import { ClassModel } from "../../classes/class_model";

export class ClassModelSequelize extends ClassModel {
  constructor(id, diagramId, name, desc, type, version, storedIn, defaultValues) {
    super(id, diagramId, name, desc, type, version, storedIn);
    this.def_freezeTableName = defaultValues.def_freezeTableName || true;
    this.def_timestamps = defaultValues.def_timestamps || true;
    this.def_paranoid = defaultValues.def_paranoid || true;
    this.def_tabletype = defaultValues.def_tabletype || "na";
    this.def_collation = defaultValues.def_collation || "";
    this.def_charset = defaultValues.def_charset || "";
    this.def_cols = defaultValues.def_cols || [];
    this.def_coltopk = defaultValues.def_coltopk || true;
    this.def_version = defaultValues.def_version || false;
    this.def_underscored = defaultValues.def_underscored || false;
  }
}
