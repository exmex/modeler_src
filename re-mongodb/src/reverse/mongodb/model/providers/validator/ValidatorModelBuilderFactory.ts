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

import { CollectionInfo } from "mongodb";
import { ModelDescriptionProvider } from "../common/ModelDescriptionProvider";
import { MongoDBDiagramItemColorProvider } from "../common/MongoDBDiagramItemColorProvider";
import { MongoDBModelObjectsProvider } from "../common/MongoDBModelObjectsProvider";
import { NameBuilder } from "re/dist/model/provider/NameBuilder";
import { NestedDocumentStructureRegistry } from "../common/NestedDocumentStructureRegistry";
import { NoRelationsProvider } from "./relation/NoRelationsProvider";
import { OtherObjectsProvider } from "../common/OtherObjectsProvider";
import { ParentProcesNotification } from "../../../ParentProcessNotification";
import { TablesProvider } from "../common/table/TablesProvider";
import { ValidatorProgressProvider } from "./ValidatorProgressProvider";
import { ValidatorTableDetailProviderFactory } from "./table/ValidatorTableDetailProviderFactory";

export class ValidatorModelBuilderFactory {
  public createBuilder(
    collections: CollectionInfo[],
    knownIdRegistry: KnownIdRegistry,
    reverseOptions: ReverseOptions
  ): ModelBuilder {
    const namesRegistry = new NamesRegistry(
      new NameBuilder(new ContainerNameProvider())
    );
    const modelDescriptionProvider = new ModelDescriptionProvider(
      namesRegistry,
      reverseOptions
    );
    const nestedDocumentRegistry = new NestedDocumentStructureRegistry();
    const progress = new ParentProcesNotification("MONGODB");
    const tablesProvider = new TablesProvider(
      collections,
      nestedDocumentRegistry,
      new ValidatorTableDetailProviderFactory(
        nestedDocumentRegistry,
        progress,
        namesRegistry
      ),
      new ValidatorProgressProvider(collections, progress),
      namesRegistry
    );

    const relationsProvider = new NoRelationsProvider();
    const otherObjectsProvider = new OtherObjectsProvider();
    const tablesRelationsProvider = new MongoDBModelObjectsProvider(
      tablesProvider,
      relationsProvider,
      otherObjectsProvider
    );

    const mainDiagramProvider = new MainDiagramProvider(
      namesRegistry,
      knownIdRegistry
    );
    const mainDiagramItemsProvider = new MainDiagramItemsProvider(
      namesRegistry,
      new MongoDBDiagramItemColorProvider(),
      knownIdRegistry
    );

    return new ModelBuilder(
      mainDiagramProvider,
      modelDescriptionProvider,
      tablesRelationsProvider,
      mainDiagramItemsProvider,
      new WarningsProvider(),
      new NotesProvider(namesRegistry, knownIdRegistry),
      new LinesProvider(namesRegistry, knownIdRegistry),
      new LayoutUpdateDiagramsProvider(namesRegistry, knownIdRegistry),
      knownIdRegistry
    );
  }
}
