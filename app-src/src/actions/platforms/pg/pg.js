import { ModelTypes } from "../../../enums/enums";

export function updatePgTargetColumn(type, colToAdd) {
  if (type === ModelTypes.PG) {
    if (colToAdd.datatype === "bigserial") {
      colToAdd.datatype = "bigint";
    }
    if (colToAdd.datatype === "serial") {
      colToAdd.datatype = "integer";
    }
    if (colToAdd.datatype === "smallserial") {
      colToAdd.datatype = "smallint";
    }
    if (colToAdd.datatype === "serial8") {
      colToAdd.datatype = "int8";
    }
    if (colToAdd.datatype === "serial4") {
      colToAdd.datatype = "int4";
    }
    if (colToAdd.datatype === "serial2") {
      colToAdd.datatype = "int2";
    }
  }
}
