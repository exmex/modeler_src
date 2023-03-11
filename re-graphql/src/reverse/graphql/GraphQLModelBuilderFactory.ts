import {
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

import { ContainerNameProvider } from "re";
import { EnumProvider } from "./model/provider/EnumProvider";
import { GraphQLDiagramItemColorProvider } from "./model/provider/GraphQLDiagramItemColorProvider";
import { GraphQLModelDescriptionProvider } from "./model/provider/GraphQLModelDescriptionProvider";
import { GraphQLModelObjectsProvider } from "./model/provider/GraphQLModelObjectsProvider";
import { GraphQLModelRefsFixator } from "./model/provider/GraphQLModelRefsFixator";
import { GraphQLOtherObjectsProvider } from "./model/provider/GraphQLOtherObjectsProvider";
import { GraphQLRelationsProvider } from "./model/provider/GraphQLRelationsProvider";
import { GraphQLSchemaParser } from "../../db/graphql/GraphQLSchemaParser";
import { GraphQLTablesProvider } from "./model/provider/GraphQLTablesProvider";
import { MutationProvider } from "./model/provider/MutationProvider";
import { NameBuilder } from "re/dist/model/provider/NameBuilder";
import { QueryProvider } from "./model/provider/QueryProvider";
import { ScalarProvider } from "./model/provider/ScalarProvider";

export class GraphQLModelBuilderFactory {
  public constructor(
    private schemaParser: GraphQLSchemaParser,
    private knownIdRegistry: KnownIdRegistry,
    private reverseOptions: ReverseOptions
  ) {}

  public createBuilder(): ModelBuilder {
    const namesRegistry = new NamesRegistry(
      new NameBuilder(new ContainerNameProvider())
    );
    const modelDescriptionProvider = new GraphQLModelDescriptionProvider(
      namesRegistry,
      this.reverseOptions
    );
    const modelObjectsProvider = new GraphQLModelObjectsProvider(
      new GraphQLOtherObjectsProvider(
        new EnumProvider(this.schemaParser, namesRegistry),
        new QueryProvider(this.schemaParser),
        new MutationProvider(this.schemaParser),
        new ScalarProvider(this.schemaParser, namesRegistry)
      ),
      new GraphQLTablesProvider(this.schemaParser, namesRegistry),
      new GraphQLRelationsProvider(this.schemaParser, namesRegistry),
      new GraphQLModelRefsFixator(namesRegistry),
      namesRegistry
    );

    const modelMainDiagramProvider = new MainDiagramProvider(
      namesRegistry,
      this.knownIdRegistry
    );
    const modelMainDiagramItemsProvider = new MainDiagramItemsProvider(
      namesRegistry,
      new GraphQLDiagramItemColorProvider(),
      this.knownIdRegistry
    );

    return new ModelBuilder(
      modelMainDiagramProvider,
      modelDescriptionProvider,
      modelObjectsProvider,
      modelMainDiagramItemsProvider,
      new WarningsProvider(),
      new NotesProvider(namesRegistry, this.knownIdRegistry),
      new LinesProvider(namesRegistry, this.knownIdRegistry),
      new LayoutUpdateDiagramsProvider(namesRegistry, this.knownIdRegistry),
      this.knownIdRegistry
    );
  }
}
