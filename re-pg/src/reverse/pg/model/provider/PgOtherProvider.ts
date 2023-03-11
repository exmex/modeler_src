import { OtherObjectTypes, OtherObjects } from "common";

import { KnownIdRegistry } from "re";
import { ModelPartProvider } from "re";
import _ from "lodash";

export class PgOtherProvider implements ModelPartProvider<OtherObjects> {
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
