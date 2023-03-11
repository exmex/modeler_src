import { ModelPartProvider, NamesRegistry } from "re";

import { OtherObjects } from "common";

export class OtherObjectsProvider implements ModelPartProvider<OtherObjects> {
  public constructor(
    private viewProvider: ModelPartProvider<OtherObjects>,
    private procedureProvider: ModelPartProvider<OtherObjects>,
    private functionProvider: ModelPartProvider<OtherObjects>,
    private triggerProvider: ModelPartProvider<OtherObjects>,
    private otherProvider: ModelPartProvider<OtherObjects>,
    private namesRegistry: NamesRegistry
  ) {}

  public async provide(): Promise<OtherObjects> {
    const views = await this.viewProvider.provide();
    Object.keys(views)
      .map((key) => views[key])
      .forEach((item) => this.namesRegistry.registerOtherObject(item));
    const procedures = await this.procedureProvider.provide();
    Object.keys(procedures)
      .map((key) => procedures[key])
      .forEach((item) => this.namesRegistry.registerOtherObject(item));
    const functions = await this.functionProvider.provide();
    Object.keys(functions)
      .map((key) => functions[key])
      .forEach((item) => this.namesRegistry.registerOtherObject(item));
    const triggers = await this.triggerProvider.provide();
    Object.keys(triggers)
      .map((key) => triggers[key])
      .forEach((item) => this.namesRegistry.registerOtherObject(item));

    const others = await this.otherProvider.provide();
    Object.keys(others)
      .map((key) => others[key])
      .forEach((item) => this.namesRegistry.registerOtherObject(item));

    return {
      ...views,
      ...procedures,
      ...functions,
      ...triggers,
      ...others
    };
  }
}
