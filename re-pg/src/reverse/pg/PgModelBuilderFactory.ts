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

import { ArrayParser } from "./model/provider/ArrayParser";
import { KnownIdRegistry } from "re";
import { PgAncestorFinder } from "./re/builder/PgAncestorFinder";
import { PgColumnRE } from "./re/PgColumnRE";
import { PgCompositeTypeRE } from "./re/PgCompositeTypeRE";
import { PgConstraintRE } from "./re/PgConstraintRE";
import { PgDiagramItemColorProvider } from "./model/provider/PgDiagramItemColorProvider";
import { PgExpressionIndexGenerator } from "./re/builder/PgExpressionIndexGenerator";
import { PgFeatures } from "./PgFeatures";
import { PgIdentifierParser } from "../../db/pg/pg-identifier-parser";
import { PgIndexRE } from "./re/PgIndexRE";
import { PgInternalObjectCleaner } from "./model/provider/PgInternalObjectCleaner";
import { PgJSONObjectsProvider } from "./PgJSONObjectsProvider";
import { PgMViewProvider } from "./model/provider/PgMViewProvider";
import { PgMViewSourceGenerator } from "./model/generator/PgMViewSourceGenerator";
import { PgModelDescriptionProvider } from "./model/provider/PgModelDescriptionProvider";
import { PgModelObjectsProvider } from "./model/provider/PgModelObjectsProvider";
import { PgOrderBuilder } from "./model/provider/PgOrderBuilder";
import { PgOtherObjectsProvider } from "./model/provider/PgOtherObjectsProvider";
import { PgOtherProvider } from "./model/provider/PgOtherProvider";
import { PgPartitionMetadataBuilder } from "./re/builder/PgPartitionMetadataBuilder";
import { PgPartitionTableCleaner } from "./model/provider/PgPartitionTableCleaner";
import { PgPartitionsRE } from "./re/PgPartitionsRE";
import { PgPolicyProvider } from "./model/provider/PgPolicyProvider";
import { PgPolicySourceGenerator } from "./model/generator/PgPolicySourceGenerator";
import { PgQuotation } from "../../db/pg/pg-quotation";
import { PgRoutineProvider } from "./model/provider/PgRoutineProvider";
import { PgRoutineSourceGenerator } from "./model/generator/PgRoutineSourceGenerator";
import { PgRuleProvider } from "./model/provider/PgRuleProvider";
import { PgRuleSourceGenerator } from "./model/generator/PgRuleSourceGenerator";
import { PgSchemaRE } from "./re/PgSchemaRE";
import { PgSequenceProvider } from "./model/provider/PgSequenceProvider";
import { PgSequenceSourceGenerator } from "./model/generator/PgSequenceSourceGenerator";
import { PgTableRE } from "./re/PgTableRE";
import { PgTableRelationMetadataBuilder } from "./re/builder/PgTableRelationMetadataBuilder";
import { PgTablesRelationsProvider } from "./model/provider/PgTablesRelationsProvider";
import { PgTriggerProvider } from "./model/provider/PgTriggerProvider";
import { PgTriggerSourceGenerator } from "./model/generator/PgTriggerSourceGenerator";
import { PgTypeProvider } from "./model/provider/PgTypeProvider";
import { PgTypeSourceGenerator } from "./model/generator/PgTypeSourceGenerator";
import { PgUserDataTypeRegistry } from "./PgUserDataTypeRegistry";
import { PgViewMViewDependencyResolver } from "./model/provider/PgViewMViewDependencyResolver";
import { PgViewProvider } from "./model/provider/PgViewProvider";
import { PgViewSourceGenerator } from "./model/generator/PgViewSourceGenerator";
import { SequenceRegistry } from "./SequenceRegistry";

export class PgModelBuilderFactory {
  public constructor(
    private connection: SQLHandledConnection<PgFeatures>,
    private schema: string,
    private reverseOptions: ReverseOptions,
    private features: PgFeatures,
    private quotation: PgQuotation,
    private identifierParser: PgIdentifierParser,
    private userDataTypeRegistry: PgUserDataTypeRegistry,
    private arrayParser: ArrayParser,
    private namesRegistry: NamesRegistry,
    private dependencyRegistry: DependenciesRegistry,
    private sequenceRegistry: SequenceRegistry,
    private knownIdRegistry: KnownIdRegistry
  ) {}
  public createBuilder(): ModelBuilder {
    const otherObjectsProvider = new PgOtherObjectsProvider(
      new PgViewProvider(
        this.connection,
        new PgViewSourceGenerator(
          this.quotation,
          this.reverseOptions.includeSchema
        ),
        this.knownIdRegistry,
        this.schema
      ),
      new PgMViewProvider(
        this.connection,
        new PgMViewSourceGenerator(
          this.quotation,
          this.reverseOptions.includeSchema
        ),
        this.knownIdRegistry,
        this.schema
      ),
      new PgRoutineProvider(
        this.connection,
        new PgRoutineSourceGenerator(
          this.quotation,
          this.reverseOptions.includeSchema
        ),
        this.knownIdRegistry,
        this.schema
      ),
      new PgTriggerProvider(
        this.connection,
        new PgTriggerSourceGenerator(
          this.quotation,
          this.reverseOptions.includeSchema
        ),
        this.knownIdRegistry,
        this.quotation,
        this.schema
      ),
      new PgSequenceProvider(
        this.connection,
        new PgSequenceSourceGenerator(
          this.quotation,
          this.reverseOptions.includeSchema
        ),
        this.knownIdRegistry,
        this.schema,
        this.features
      ),
      new PgTypeProvider(
        this.connection,
        new PgTypeSourceGenerator(
          this.quotation,
          this.reverseOptions.includeSchema
        ),
        this.knownIdRegistry,
        this.schema,
        this.userDataTypeRegistry,
        this.identifierParser,
        this.reverseOptions
      ),
      new PgRuleProvider(
        this.connection,
        new PgRuleSourceGenerator(
          this.quotation,
          this.reverseOptions.includeSchema
        ),
        this.knownIdRegistry,
        this.schema,
        this.quotation
      ),
      new PgPolicyProvider(
        this.connection,
        new PgPolicySourceGenerator(
          this.quotation,
          this.arrayParser,
          this.reverseOptions.includeSchema
        ),
        this.knownIdRegistry,
        this.schema,
        this.quotation,
        this.features,
        this.arrayParser
      ),
      new PgOtherProvider(this.knownIdRegistry),
      new PgViewMViewDependencyResolver(
        this.connection,
        this.schema,
        this.dependencyRegistry
      )
    );

    const modelWarningsProvider = new WarningsProvider();

    const tablesRelationsProvider = new PgTablesRelationsProvider(
      new PgTableRelationMetadataBuilder(
        new PgCompositeTypeRE(this.connection, this.schema, this.features),
        new PgTableRE(this.connection, this.schema, this.features),
        new PgColumnRE(this.connection, this.schema, this.features),
        new PgConstraintRE(this.connection, this.schema, this.features),
        new PgIndexRE(this.connection, this.schema, this.features),
        new JSONRE(
          this.reverseOptions.sampleLimit < 0
            ? new NoJSONColumnRE()
            : new ObjectsJSONColumnRE(
                new PgJSONObjectsProvider(
                  this.connection,
                  this.schema,
                  this.reverseOptions.sampleLimit,
                  this.quotation
                )
              )
        ),
        this.arrayParser,
        this.userDataTypeRegistry,
        new PgExpressionIndexGenerator(this.quotation),
        new PgPartitionMetadataBuilder(
          this.arrayParser,
          new PgPartitionsRE(this.connection, this.schema, this.features),
          this.quotation,
          new PgAncestorFinder()
        ),
        this.knownIdRegistry
      ),
      this.quotation,
      this.identifierParser,
      this.userDataTypeRegistry,
      this.dependencyRegistry,
      this.sequenceRegistry,
      this.reverseOptions,
      modelWarningsProvider,
      this.knownIdRegistry
    );

    const modelDescriptionProvider = new PgModelDescriptionProvider(
      this.schema,
      this.reverseOptions,
      new PgSchemaRE(this.connection, this.schema),
      new PgQuotation(),
      this.namesRegistry,
      this.knownIdRegistry
    );

    const modelObjectsProvider = new PgModelObjectsProvider(
      otherObjectsProvider,
      tablesRelationsProvider,
      new PgInternalObjectCleaner(this.sequenceRegistry),
      new PgPartitionTableCleaner(),
      new PgOrderBuilder(this.dependencyRegistry),
      this.namesRegistry
    );

    const mainDiagramProvider = new MainDiagramProvider(
      this.namesRegistry,
      this.knownIdRegistry
    );

    const mainDiagramItemsProvider = new MainDiagramItemsProvider(
      this.namesRegistry,
      new PgDiagramItemColorProvider(),
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
