import {
  MainDiagramProvider,
  ModelBuilder,
  NamesRegistry,
  WarningsProvider
} from "re";

import { DefinitionsRegistry } from "./provider/DefinitionsRegistry";
import { DiagramVisualization } from "./provider/DiagramVisualization";
import { JSONSchemaDiagramItemColorProvider } from "./provider/JSONSchemaDiagramItemColorProvider";
import { JSONSchemaDiagramsItemsProvider } from "./JSONSchemaDiagramsItemsProvider";
import { JSONSchemaMainDiagramProvider } from "./JSONSchemaMainDiagramProvider";
import { JSONSchemaModelDescriptionProvider } from "./provider/JSONSchemaModelDescriptionProvider";
import { JSONSchemaModelObjectsProvider } from "./provider/JSONSchemaModelObjectsProvider";
import { ModelProvider } from "./provider/ModelProvider";
import { PropertyTypeProvider } from "./provider/PropertyTypeProvider";
import { RefProvider } from "./provider/RefProvider";
import { SchemaProvider } from "./provider/SchemaProvider";

export class JSONSchemaModelBuilderFactory {
  public constructor(
    private schema: any,
    private strict: boolean,
    private format: string
  ) {}

  public createBuilder(): ModelBuilder {
    const namesRegistry = new NamesRegistry();
    const definitionsRegistry = new DefinitionsRegistry();
    const modelProvider = new ModelProvider(namesRegistry);
    const modelDescriptionProvider = new JSONSchemaModelDescriptionProvider(
      namesRegistry,
      this.schema,
      this.strict,
      this.format
    );
    const schemaProvider = new SchemaProvider();
    const modelObjectsProvider = new JSONSchemaModelObjectsProvider(
      namesRegistry,
      definitionsRegistry,
      this.schema,
      new PropertyTypeProvider(schemaProvider),
      new DiagramVisualization(schemaProvider),
      new RefProvider(definitionsRegistry, modelProvider),
      new ModelProvider(namesRegistry),
      schemaProvider
    );

    const modelJSONSchemaMainDiagramProvider =
      new JSONSchemaMainDiagramProvider(namesRegistry);
    const modelErdMainDiagramProvider = new MainDiagramProvider(namesRegistry);
    const modelMainDiagramItemsProvider = new JSONSchemaDiagramsItemsProvider(
      namesRegistry,
      definitionsRegistry,
      new JSONSchemaDiagramItemColorProvider(definitionsRegistry),
      modelErdMainDiagramProvider
    );

    return new ModelBuilder(
      modelJSONSchemaMainDiagramProvider,
      modelDescriptionProvider,
      modelObjectsProvider,
      modelMainDiagramItemsProvider,
      new WarningsProvider()
    );
  }
}
