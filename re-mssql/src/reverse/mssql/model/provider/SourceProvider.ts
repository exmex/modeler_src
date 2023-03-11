import { ModelPartProvider, SQLHandledConnection } from "re";
import { OtherObject, OtherObjects } from "common";

import { KnownIdRegistry } from "re";
import { MSSQLFeatures } from "../../MSSQLFeatures";
import { SourceGenerator } from "../generator/SourceGenerator";
import { SourceMetadata } from "./SourceMetadata";

export abstract class SourceProvider<Metadata extends SourceMetadata>
  implements ModelPartProvider<OtherObjects>
{
  public constructor(
    private client: SQLHandledConnection<MSSQLFeatures>,
    private generator: SourceGenerator<Metadata>,
    protected knownIdRegistry: KnownIdRegistry
  ) {
    this.client = client;
    this.generator = generator;
  }

  public async provide(): Promise<OtherObjects> {
    const result: OtherObjects = {};
    const objectMetadataMap = new Map<string, Metadata>();

    await this.reverse(objectMetadataMap);

    objectMetadataMap.forEach((routineMetadata: Metadata): void => {
      const obj = this.createObject(routineMetadata);
      result[obj.id] = obj;
    });

    return result;
  }

  protected abstract createObject(object: Metadata): OtherObject;

  protected abstract getQuery(): string;

  protected abstract getParameters(): any[];

  private async reverse(objectMetadata: Map<string, Metadata>): Promise<void> {
    if (!this.isAvailable()) {
      return;
    }
    const queryResultRaw = await this.client.query(
      this.getQuery(),
      this.getParameters()
    );
    const queryResult = this.convertResult(queryResultRaw);
    const result = queryResult.map(
      (item: Metadata): Metadata => ({
        ...item,
        _code: this.generator.generate(item)
      })
    );
    result.forEach((metadata: Metadata): void => {
      objectMetadata.set(this.getName(metadata), metadata);
    });
  }

  protected convertResult(queryResultRaw: any[]): Metadata[] {
    return queryResultRaw;
  }

  protected isAvailable(): boolean {
    return true;
  }

  protected getName(metadata: Metadata): string {
    return metadata._name;
  }
}
