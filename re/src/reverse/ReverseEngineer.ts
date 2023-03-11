import { Category, Task } from "../task/Task";
import { FileSource, MemoryAutolayout } from "al";

import { Features } from "./common/Features";
import { HandledConnection } from "../db/HandledConnection";
import { Info } from "../info/Info";
import { LayoutDiagramProvider } from "./diagram-provider/LayoutDiagramProvider";
import { MoonModelerModel } from "common";
import { ReverseOptions } from "./ReverseOptions";

export abstract class ReverseEngineer<
  U extends Features,
  T extends HandledConnection<U>
> implements Task<U, T>
{
  public constructor(
    protected reverseOptions: ReverseOptions,
    private autolayout: MemoryAutolayout,
    private layoutDiagramProvider: LayoutDiagramProvider
  ) {}

  public getErrorCategory(_error: Error): string {
    return Category.INTERNAL;
  }

  public async execute(connection: T, info: Info): Promise<void> {
    const model = await this.prepareModel(connection);
    this.layoutModel(model);
    const source = new FileSource<MoonModelerModel>(
      this.reverseOptions.outputFilename
    );
    source.storeModel(model);
    info.reportSuccess();
  }

  private layoutModel(model: MoonModelerModel): void {
    if (this.reverseOptions.autolayout) {
      this.autolayout.layout(model, this.layoutDiagramProvider.provide(model));
    }
  }

  protected abstract prepareModel(connection: T): Promise<MoonModelerModel>;
}
