import { OtherObjectTypes, OtherObjects } from "common";
import _ from "lodash";
import { KnownIdRegistry, ModelPartProvider } from "re";

export class SQLiteOtherProvider implements ModelPartProvider<OtherObjects> {
  public constructor(private knownIdRegistry: KnownIdRegistry) {}

  public provide(): Promise<OtherObjects> {
    return Promise.resolve(
      _.reduce(
        this.knownIdRegistry.getOtherObjects(),
        (result, item) => {
          if (item.type === OtherObjectTypes.Other) {
            return {
              ...result,
              [item.id]: item
            };
          }
          return result;
        },
        {}
      )
    );
  }
}
