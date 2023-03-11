import {
  Diagrams,
  LayoutUpdateDiagrams,
  Lines,
  ModelDescription,
  ModelObjects,
  MoonModelerModel,
  Notes,
  Warning
} from "common";

import { KnownIdRegistry } from "./provider/KnownIdRegistry";
import { ModelPartProvider } from "./provider/ModelPartProvider";

export class ModelBuilder {
  public constructor(
    private mainDiagramsProvider: ModelPartProvider<Diagrams>,
    private modelDescriptionProvider: ModelPartProvider<ModelDescription>,
    private modelObjectsProvider: ModelPartProvider<ModelObjects>,
    private mainDiagramItemsProvider: ModelPartProvider<Diagrams>,
    private warningsProvider: ModelPartProvider<Warning[]>,
    private notesProvider: ModelPartProvider<Notes>,
    private linesProvider: ModelPartProvider<Lines>,
    private layoutUpdateDiagramsProvider: ModelPartProvider<LayoutUpdateDiagrams>,
    private knownIdRegistry: KnownIdRegistry
  ) {}

  public async build(): Promise<MoonModelerModel> {
    await this.mainDiagramsProvider.provide();
    const model = { ...(await this.modelDescriptionProvider.provide()) };
    const tablesRelations = await this.modelObjectsProvider.provide();
    const notes = await this.notesProvider.provide();
    const lines = await this.linesProvider.provide();
    const diagrams = await this.mainDiagramItemsProvider.provide();
    const warnings = await this.warningsProvider.provide();
    const layoutUpdateDiagrams =
      await this.layoutUpdateDiagramsProvider.provide();
    const afterBuild = {
      model,
      ...tablesRelations,
      lines,
      notes,
      diagrams,
      collapsedTreeItems: [] as string[],
      warnings,
      originalModel: this.knownIdRegistry.originalModel,
      layoutUpdateDiagrams
    };
    return afterBuild;
  }
}
