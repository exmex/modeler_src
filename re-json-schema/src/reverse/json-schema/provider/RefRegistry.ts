import { NamesRegistry } from "re";

export class Ref {
  public constructor(public sourceId: string, public targetId: string) {}
}

export class RefRegistry {
  private refs: Ref[] = [];

  public constructor(private _namesRegistry: NamesRegistry) {}

  public addRef(sourceId: string, targetId: string) {
    this.refs.push(new Ref(sourceId, targetId));
  }

  public checkCycle() {}
}
