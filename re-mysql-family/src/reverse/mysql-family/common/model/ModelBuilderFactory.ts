import { JSONRE, NoJSONColumnRE, ObjectsJSONColumnRE } from "re-json";
import {
  KnownIdRegistry,
  LayoutUpdateDiagramsProvider,
  LinesProvider,
  MainDiagramItemsProvider,
  MainDiagramProvider,
  ModelBuilder,
  NamesRegistry,
  NotesProvider,
  QueryExecutor,
  ReverseOptions,
  WarningsProvider
} from "re";

import { ColumnMetadataBuilder } from "../re/structure/builder/ColumnMetadataBuilder";
import { ColumnsRE } from "../re/structure/ColumnsRE";
import { ConstraintsRE } from "../re/structure/ConstraintsRE";
import { IndexMetadataBuilder } from "../re/structure/builder/IndexMetadataBuilder";
import { IndexRE } from "../re/structure/IndexRE";
import { ModelDescriptionProvider } from "./provider/ModelDescriptionProvider";
import { ModelObjectsProvider } from "./provider/ModelObjectsProvider";
import { MySQLFamilyContainerNameProvider } from "./provider/MySQLFamilyContainerNameProvider";
import { MySQLFamilyDiagramItemColorProvider } from "./provider/MySQLFamilyDiagramItemColorProvider";
import { MySQLFamilyFeatures } from "../MySQLFamilyFeatures";
import { MySQLFamilyJSONObjectsProvider } from "../MySQLFamilyJSONObjectsProvider";
import { MySQLFamilyOrderBuilder } from "./provider/MySQLFamilyOrderBuilder";
import { MySQLFamilyRoutineProvider } from "./provider/RoutineProvider";
import { MySQLFamilySchemaRE } from "../re/structure/MariaDBSchemaRE";
import { NameBuilder } from "re/dist/model/provider/NameBuilder";
import { OtherObjectsProvider } from "./provider/OtherObjectsProvider";
import { OtherProvider } from "./provider/OtherProvider";
import { TablesRE } from "../re/structure/TablesRE";
import { TriggerDbQuery } from "../query/TriggerDbQuery";
import { TriggerProvider } from "./provider/TriggerProvider";
import { ViewDbQuery } from "../query/ViewDbQuery";
import { ViewProvider } from "./provider/ViewProvider";

export class ModelBuilderFactory {
  public createBuilder(
    queryExecutor: QueryExecutor,
    schema: string,
    reverseOptions: ReverseOptions,
    features: MySQLFamilyFeatures,
    knownIdRegistry: KnownIdRegistry
  ): ModelBuilder {
    const namesRegistry = new NamesRegistry(
      new NameBuilder(new MySQLFamilyContainerNameProvider())
    );
    const otherObjectsProvider = new OtherObjectsProvider(
      new ViewProvider(
        new ViewDbQuery(queryExecutor, schema, features),
        features,
        knownIdRegistry
      ),
      new MySQLFamilyRoutineProvider(
        queryExecutor,
        schema,
        "PROCEDURE",
        features,
        knownIdRegistry
      ),
      new MySQLFamilyRoutineProvider(
        queryExecutor,
        schema,
        "FUNCTION",
        features,
        knownIdRegistry
      ),
      new TriggerProvider(
        new TriggerDbQuery(queryExecutor, schema),
        knownIdRegistry
      ),
      new OtherProvider(knownIdRegistry),
      namesRegistry
    );

    const modelDescriptionProvider = new ModelDescriptionProvider(
      features,
      reverseOptions,
      new MySQLFamilySchemaRE(queryExecutor, schema, features),
      namesRegistry,
      knownIdRegistry
    );
    const modelObjectsProvider = new ModelObjectsProvider(
      new TablesRE(queryExecutor, schema, knownIdRegistry),
      new ColumnsRE(
        queryExecutor,
        schema,
        features,
        new ColumnMetadataBuilder(features, knownIdRegistry)
      ),
      new IndexRE(
        queryExecutor,
        schema,
        new IndexMetadataBuilder(knownIdRegistry)
      ),
      new ConstraintsRE(queryExecutor, schema, features, knownIdRegistry),
      this.createJSONRE(queryExecutor, schema, reverseOptions),
      otherObjectsProvider,
      namesRegistry,
      knownIdRegistry,
      new MySQLFamilyOrderBuilder()
    );

    const mainDiagramProvider = new MainDiagramProvider(
      namesRegistry,
      knownIdRegistry
    );
    const mainDiagramItemsProvider = new MainDiagramItemsProvider(
      namesRegistry,
      new MySQLFamilyDiagramItemColorProvider(),
      knownIdRegistry
    );

    return new ModelBuilder(
      mainDiagramProvider,
      modelDescriptionProvider,
      modelObjectsProvider,
      mainDiagramItemsProvider,
      new WarningsProvider(),
      new NotesProvider(namesRegistry, knownIdRegistry),
      new LinesProvider(namesRegistry, knownIdRegistry),
      new LayoutUpdateDiagramsProvider(namesRegistry, knownIdRegistry),
      knownIdRegistry
    );
  }

  private createJSONRE(
    queryExecutor: QueryExecutor,
    schema: string,
    reverseOptions: ReverseOptions
  ): JSONRE {
    if (reverseOptions.sampleLimit < 0) {
      return new JSONRE(new NoJSONColumnRE());
    }

    return new JSONRE(
      new ObjectsJSONColumnRE(
        new MySQLFamilyJSONObjectsProvider(
          queryExecutor,
          schema,
          reverseOptions.sampleLimit
        )
      )
    );
  }
}
