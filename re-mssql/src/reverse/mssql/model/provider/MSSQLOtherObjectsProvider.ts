import { ModelPartProvider } from "re";
import { OtherObjects } from "common";

export class MSSQLOtherObjectsProvider
  implements ModelPartProvider<OtherObjects>
{
  public constructor(
    private viewProvider: ModelPartProvider<OtherObjects>,
    private routineProvider: ModelPartProvider<OtherObjects>,
    private triggerProvider: ModelPartProvider<OtherObjects>,
    private sequenceProvider: ModelPartProvider<OtherObjects>,
    private userDefinedTypeProvider: ModelPartProvider<OtherObjects>,
    private otherProvider: ModelPartProvider<OtherObjects>
  ) {}
  public async provide(): Promise<OtherObjects> {
    const otherObjects = {
      ...(await this.viewProvider.provide()),
      ...(await this.routineProvider.provide()),
      ...(await this.triggerProvider.provide()),
      ...(await this.sequenceProvider.provide()),
      ...(await this.userDefinedTypeProvider.provide()),
      ...(await this.otherProvider.provide())
    };

    return otherObjects;
  }
}
