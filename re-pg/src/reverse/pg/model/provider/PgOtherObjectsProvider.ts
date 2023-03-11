import { ModelPartProvider } from "re";
import { OtherObjects } from "common";
import { PgViewMViewDependencyResolver } from "./PgViewMViewDependencyResolver";

export class PgOtherObjectsProvider implements ModelPartProvider<OtherObjects> {
  public constructor(
    private viewProvider: ModelPartProvider<OtherObjects>,
    private mviewProvider: ModelPartProvider<OtherObjects>,
    private routineProvider: ModelPartProvider<OtherObjects>,
    private triggerProvider: ModelPartProvider<OtherObjects>,
    private sequenceProvider: ModelPartProvider<OtherObjects>,
    private typeProvider: ModelPartProvider<OtherObjects>,
    private ruleProvider: ModelPartProvider<OtherObjects>,
    private policyProvider: ModelPartProvider<OtherObjects>,
    private otherProvider: ModelPartProvider<OtherObjects>,
    private viewMViewDependencyResolver: PgViewMViewDependencyResolver
  ) {}
  public async provide(): Promise<OtherObjects> {
    const otherObjects = {
      ...(await this.viewProvider.provide()),
      ...(await this.mviewProvider.provide()),
      ...(await this.routineProvider.provide()),
      ...(await this.triggerProvider.provide()),
      ...(await this.sequenceProvider.provide()),
      ...(await this.typeProvider.provide()),
      ...(await this.ruleProvider.provide()),
      ...(await this.policyProvider.provide()),
      ...(await this.otherProvider.provide())
    };

    await this.viewMViewDependencyResolver.resolve(otherObjects);

    return otherObjects;
  }
}
