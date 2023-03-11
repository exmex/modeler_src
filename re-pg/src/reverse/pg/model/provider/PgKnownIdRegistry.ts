import { OtherObject, Table } from "common";

import { KnownIdRegistry } from "re";
import _ from "lodash";

export class PgKnownIdRegistry extends KnownIdRegistry {
  public getTableContainerName(table: Table): string {
    return table?.pg?.schema ?? "";
  }
  public getOtherObjectContainerName(otherObject: OtherObject): string {
    return otherObject?.pg?.schema ?? "";
  }
}
