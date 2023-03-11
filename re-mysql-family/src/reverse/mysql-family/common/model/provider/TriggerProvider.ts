import { KnownIdRegistry, ModelPartProvider } from "re";
import { OtherObject, OtherObjects } from "common";

import { Query } from "../../Query";
import { TriggerMetadata } from "../../metadata/TriggerMetadata";
import { TriggerMetadataRow } from "../../query/TriggerDbQuery";
import { TriggerSourceGenerator } from "../../generator/TriggerSourceGenerator";

export class TriggerProvider implements ModelPartProvider<OtherObjects> {
  private dbQuery: Query<TriggerMetadataRow[]>;

  public constructor(
    dbQuery: Query<TriggerMetadataRow[]>,
    private knownIdRegistry: KnownIdRegistry
  ) {
    this.dbQuery = dbQuery;
  }
  public async provide(): Promise<OtherObjects> {
    const triggerQueryResult = await this.dbQuery.execute();

    const result: OtherObjects = {};

    triggerQueryResult.forEach((row: TriggerMetadataRow): void => {
      const schema = "";
      const name = row.TRIGGER_NAME;
      const type = "Trigger";
      const id = this.knownIdRegistry.getOtherObjectId(schema, name, type);

      const triggerMetadata = new TriggerMetadata(
        row.TRIGGER_NAME,
        row.ACTION_TIMING,
        row.EVENT_MANIPULATION,
        row.EVENT_OBJECT_TABLE,
        row.ACTION_STATEMENT,
        row.DEFINER
      );

      const generator = new TriggerSourceGenerator(triggerMetadata);
      const code = generator.generate();
      const trigger = this.createTrigger(id, triggerMetadata.triggerName, code);
      result[id] = trigger;
    });
    return result;
  }

  private createTrigger(id: string, name: string, code: string): OtherObject {
    return {
      id,
      visible: true,
      name,
      desc: "",
      type: "Trigger",
      code,
      lines: [],
      generate: true,
      generateCustomCode: true
    };
  }
}
