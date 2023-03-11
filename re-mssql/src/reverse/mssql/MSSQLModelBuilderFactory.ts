import {
  DependenciesRegistry,
  LayoutUpdateDiagramsProvider,
  LinesProvider,
  MainDiagramItemsProvider,
  MainDiagramProvider,
  ModelBuilder,
  NamesRegistry,
  NotesProvider,
  ReverseOptions,
  SQLHandledConnection,
  WarningsProvider
} from "re";
import { JSONRE, NoJSONColumnRE, ObjectsJSONColumnRE } from "re-json";

import { KnownIdRegistry } from "re";
import { MSSQLCheckConstraintRE } from "./re/MSSQLCheckConstraintRE";
import { MSSQLColumnRE } from "./re/MSSQLColumnRE";
import { MSSQLDependencyResolver } from "./model/provider/MSSQLDependencyResolver";
import { MSSQLDiagramItemColorProvider } from "./model/provider/MSSQLDiagramItemColorProvider";
import { MSSQLFeatures } from "./MSSQLFeatures";
import { MSSQLForeignKeyConstraintRE } from "./re/MSSQLForeignKeyConstraintRE";
import { MSSQLIndexRE } from "./re/MSSQLIndexRE";
import { MSSQLJSONObjectsProvider } from "./MSSQLJSONObjectsProvider";
import { MSSQLKeyConstraintRE } from "./re/MSSQLKeyConstraintRE";
import { MSSQLModelDescriptionProvider } from "./model/provider/MSSQLModelDescriptionProvider";
import { MSSQLModelObjectsProvider } from "./model/provider/MSSQLModelObjectsProvider";
import { MSSQLOrderBuilder } from "./model/provider/MSSQLOrderBuilder";
import { MSSQLOtherObjectsProvider } from "./model/provider/MSSQLOtherObjectsProvider";
import { MSSQLOtherProvider } from "./model/provider/MSSQLOtherProvider";
import { MSSQLQuotation } from "../../db/mssql/mssql-quotation";
import { MSSQLRoutineProvider } from "./model/provider/MSSQLRoutineProvider";
import { MSSQLRoutineSourceGenerator } from "./model/generator/MSSQLRoutineSourceGenerator";
import { MSSQLSchemasRE } from "./re/MSSQLSchemasRE";
import { MSSQLSequenceProvider } from "./model/provider/MSSQLSequenceProvider";
import { MSSQLTableRE } from "./re/MSSQLTableRE";
import { MSSQLTableRelationMetadataBuilder } from "./re/builder/MSSQLTableRelationMetadataBuilder";
import { MSSQLTablesRelationsProvider } from "./model/provider/MSSQLTablesRelationsProvider";
import { MSSQLTriggerProvider } from "./model/provider/MSSQLTriggerProvider";
import { MSSQLTriggerSourceGenerator } from "./model/generator/MSSQLTriggerSourceGenerator";
import { MSSQLUserDefinedTypeProvider } from "./model/provider/MSSQLUserDefinedTypeProvider";
import { MSSQLUserDefinedTypeRegistry } from "./MSSQLUserDefinedTypeRegistry";
import { MSSQLViewProvider } from "./model/provider/MSSQLViewProvider";
import { MSSQLViewSourceGenerator } from "./model/generator/MSSQLViewSourceGenerator";
import { SourceGenerator } from "./model/generator/SourceGenerator";

export class MSSQLModelBuilderFactory {
  public constructor(
    private connection: SQLHandledConnection<MSSQLFeatures>,
    private reverseOptions: ReverseOptions,
    private features: MSSQLFeatures,
    private quotation: MSSQLQuotation,
    private userDefinedTypeRegistry: MSSQLUserDefinedTypeRegistry,
    private namesRegistry: NamesRegistry,
    private dependencyRegistry: DependenciesRegistry,
    private knownIdRegistry: KnownIdRegistry
  ) {}
  public createBuilder(): ModelBuilder {
    const otherObjectsProvider = new MSSQLOtherObjectsProvider(
      new MSSQLViewProvider(
        this.connection,
        new MSSQLViewSourceGenerator(
          this.quotation,
          this.reverseOptions.includeSchema
        ),
        this.knownIdRegistry
      ),
      new MSSQLRoutineProvider(
        this.connection,
        new MSSQLRoutineSourceGenerator(
          this.quotation,
          this.reverseOptions.includeSchema
        ),
        this.knownIdRegistry
      ),
      new MSSQLTriggerProvider(
        this.connection,
        new MSSQLTriggerSourceGenerator(
          this.quotation,
          this.reverseOptions.includeSchema
        ),
        this.knownIdRegistry,
        this.quotation
      ),
      new MSSQLSequenceProvider(
        this.connection,
        new SourceGenerator(),
        this.knownIdRegistry
      ),
      new MSSQLUserDefinedTypeProvider(
        this.connection,
        new SourceGenerator(),
        this.knownIdRegistry,
        this.userDefinedTypeRegistry,
        this.reverseOptions
      ),
      new MSSQLOtherProvider(this.knownIdRegistry)
    );

    const modelWarningsProvider = new WarningsProvider();

    const tablesRelationsProvider = new MSSQLTablesRelationsProvider(
      new MSSQLTableRelationMetadataBuilder(
        new MSSQLTableRE(this.connection, this.features),
        new MSSQLColumnRE(this.connection, this.features),
        new MSSQLKeyConstraintRE(this.connection, this.features),
        new MSSQLCheckConstraintRE(this.connection, this.features),
        new MSSQLForeignKeyConstraintRE(this.connection, this.features),
        new MSSQLIndexRE(this.connection, this.features),
        new JSONRE(
          this.reverseOptions.sampleLimit < 0
            ? new NoJSONColumnRE()
            : new ObjectsJSONColumnRE(
                new MSSQLJSONObjectsProvider(
                  this.connection,
                  this.reverseOptions.sampleLimit,
                  this.quotation
                )
              )
        ),
        this.knownIdRegistry
      ),
      this.quotation,
      this.userDefinedTypeRegistry,
      this.dependencyRegistry,
      this.reverseOptions,
      modelWarningsProvider,
      this.knownIdRegistry
    );

    const modelDescriptionProvider = new MSSQLModelDescriptionProvider(
      this.reverseOptions,
      new MSSQLSchemasRE(this.connection),
      new MSSQLQuotation(),
      this.namesRegistry,
      this.knownIdRegistry
    );

    const modelObjectsProvider = new MSSQLModelObjectsProvider(
      otherObjectsProvider,
      tablesRelationsProvider,
      new MSSQLOrderBuilder(this.dependencyRegistry),
      this.namesRegistry,
      new MSSQLDependencyResolver(this.connection, this.dependencyRegistry)
    );

    const mainDiagramProvider = new MainDiagramProvider(
      this.namesRegistry,
      this.knownIdRegistry
    );

    const mainDiagramItemsProvider = new MainDiagramItemsProvider(
      this.namesRegistry,
      new MSSQLDiagramItemColorProvider(),
      this.knownIdRegistry
    );

    return new ModelBuilder(
      mainDiagramProvider,
      modelDescriptionProvider,
      modelObjectsProvider,
      mainDiagramItemsProvider,
      modelWarningsProvider,
      new NotesProvider(this.namesRegistry, this.knownIdRegistry),
      new LinesProvider(this.namesRegistry, this.knownIdRegistry),
      new LayoutUpdateDiagramsProvider(
        this.namesRegistry,
        this.knownIdRegistry
      ),
      this.knownIdRegistry
    );
  }
}
