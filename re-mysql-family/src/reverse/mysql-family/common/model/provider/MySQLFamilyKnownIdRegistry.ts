import { OtherObject, Table } from "common";

import { KnownIdRegistry } from "re";
import _ from "lodash";

export class MySQLFamilyKnownIdRegistry extends KnownIdRegistry {
  public getTableContainerName(table: Table): string {
    return table?.database ?? "";
  }
  public getOtherObjectContainerName(otherObject: OtherObject): string {
    return "";
  }
}
