import {
  ContainerNameProvider,
  KnownIdRegistry,
  LayoutUpdateDiagramsProvider,
  LinesProvider,
  MainDiagramItemsProvider,
  MainDiagramProvider,
  ModelBuilder,
  NamesRegistry,
  NotesProvider,
  ReverseOptions,
  WarningsProvider
} from "re";
import { JSONRE, ObjectsJSONColumnRE } from "re-json";

import { NameBuilder } from "re/dist/model/provider/NameBuilder";
import { SQLiteDiagramItemColorProvider } from "./model/provider/SQLiteDiagramItemColorProvider";
import { SQLiteFKRE } from "./re/SQLiteFKRE";
import { SQLiteHandledConnection } from "../../db/sqlite/sqlite-handled-connection";
import { SQLiteIndexRE } from "./re/SQLiteIndexRE";
import { SQLiteJSONObjectsProvider } from "./SQLiteJSONObjectsProvider";
import { SQLiteModelDescriptionProvider } from "./model/provider/SQLiteModelDescriptionProvider";
import { SQLiteModelObjectsProvider } from "./model/provider/SQLiteModelObjectsProvider";
import { SQLiteOtherObjectsProvider } from "./model/provider/SQLiteOtherObjectsProvider";
import { SQLiteQuotation } from "../../db/sqlite/sqlite-quotation";
import { SQLiteTableRE } from "./re/SQLiteTableRE";
import { SQLiteTableRelationMetadataBuilder } from "./re/builder/SQLiteTableRelationMetadataBuilder";
import { SQLiteTablesRelationsProvider } from "./model/provider/SQLiteTablesRelationsProvider";
import { SQLiteTriggerProvider } from "./model/provider/SQLiteTriggerProvider";
import { SQLiteViewProvider } from "./model/provider/SQLiteViewProvider";
import { SourceGenerator } from "./model/generator/SourceGenerator";
import { SourceMetadata } from "./model/provider/SourceMetadata";
import { SQLiteOtherProvider } from "./model/provider/SQLiteOtherProvider";
import { SQLiteOrderBuilder } from "./model/provider/SQLiteOrderBuilder";

export class SQLiteModelBuilderFactory {
  public constructor(
    private connection: SQLiteHandledConnection,
    private reverseOptions: ReverseOptions,
    private quotation: SQLiteQuotation,
    private knownIdRegistry: KnownIdRegistry
  ) {}
  public createBuilder(): ModelBuilder {
    const namesRegistry = new NamesRegistry(
      new NameBuilder(new ContainerNameProvider())
    );
    const otherObjectsProvider = new SQLiteOtherObjectsProvider(
      new SQLiteViewProvider(
        this.connection,
        new SourceGenerator<SourceMetadata>(),
        this.knownIdRegistry
      ),
      new SQLiteTriggerProvider(
        this.connection,
        new SourceGenerator<SourceMetadata>(),
        this.knownIdRegistry
      ),
      new SQLiteOtherProvider(this.knownIdRegistry)
    );

    const modelWarningsProvider = new WarningsProvider();

    const tablesRelationsProvider = new SQLiteTablesRelationsProvider(
      new SQLiteTableRelationMetadataBuilder(
        new SQLiteTableRE(this.connection),
        new SQLiteFKRE(this.connection),
        new SQLiteIndexRE(this.connection),
        new JSONRE(
          new ObjectsJSONColumnRE(
            new SQLiteJSONObjectsProvider(
              this.connection,
              this.reverseOptions.sampleLimit,
              this.quotation
            )
          )
        ),
        modelWarningsProvider,
        this.knownIdRegistry
      ),
      this.quotation,
      modelWarningsProvider,
      this.knownIdRegistry
    );

    const modelDescriptionProvider = new SQLiteModelDescriptionProvider(
      this.reverseOptions,
      namesRegistry,
      this.knownIdRegistry
    );

    const modelObjectsProvider = new SQLiteModelObjectsProvider(
      otherObjectsProvider,
      tablesRelationsProvider,
      namesRegistry,
      new SQLiteOrderBuilder()
    );

    const modelMainDiagramProvider = new MainDiagramProvider(
      namesRegistry,
      this.knownIdRegistry
    );
    const modelMainDiagramItemsProvider = new MainDiagramItemsProvider(
      namesRegistry,
      new SQLiteDiagramItemColorProvider(),
      this.knownIdRegistry
    );

    return new ModelBuilder(
      modelMainDiagramProvider,
      modelDescriptionProvider,
      modelObjectsProvider,
      modelMainDiagramItemsProvider,
      modelWarningsProvider,
      new NotesProvider(namesRegistry, this.knownIdRegistry),
      new LinesProvider(namesRegistry, this.knownIdRegistry),
      new LayoutUpdateDiagramsProvider(namesRegistry, this.knownIdRegistry),
      this.knownIdRegistry
    );
  }
}
