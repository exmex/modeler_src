import { KnownIdRegistry, ModelPartProvider } from "re";
import { OtherObjectTypes, OtherObjects } from "common";

import _ from "lodash";

export class OtherProvider implements ModelPartProvider<OtherObjects> {
  public constructor(private knownIdRegistry: KnownIdRegistry) {}

  public async provide(): Promise<OtherObjects> {
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
