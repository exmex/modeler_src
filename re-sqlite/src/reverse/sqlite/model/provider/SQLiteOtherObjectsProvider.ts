import { ModelPartProvider } from "re";
import { OtherObjects } from "common";

export class SQLiteOtherObjectsProvider
  implements ModelPartProvider<OtherObjects>
{
  public constructor(
    private viewProvider: ModelPartProvider<OtherObjects>,
    private triggerProvider: ModelPartProvider<OtherObjects>,
    private otherProvider: ModelPartProvider<OtherObjects>
  ) {}
  public async provide(): Promise<OtherObjects> {
    return {
      ...(await this.viewProvider.provide()),
      ...(await this.triggerProvider.provide()),
      ...(await this.otherProvider.provide())
    };
  }
}
