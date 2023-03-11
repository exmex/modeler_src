import { OtherObject, Table } from "common";

import { KnownIdRegistry } from "re";
import _ from "lodash";

export class MSSQLKnownIdRegistry extends KnownIdRegistry {
  public getTableContainerName(table: Table): string {
    return table?.mssql?.schema ?? "";
  }
  public getOtherObjectContainerName(otherObject: OtherObject): string {
    return otherObject?.mssql?.schema ?? "";
  }
}
