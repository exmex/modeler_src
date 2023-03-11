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

import { BSONDatatypeProvider } from "./column/BSONDatatypeProvider";
import { BSONNestedDocumentProvider } from "./table/BSONNestedDocumentProvider";
import { BSONRelationRegistry } from "./relation/BSONRelationRegistry";
import { BSONRelationsProvider } from "./relation/BSONRelationsProvider";
import { BSONTableDetailProviderFactory } from "./table/BSONTableDetailProviderFactory";
import { CollectionInfo } from "mongodb";
import { DataProgressProvider } from "../common/DataProgressProvider";
import { ModelDescriptionProvider } from "../common/ModelDescriptionProvider";
import { MongoDBDiagramItemColorProvider } from "../common/MongoDBDiagramItemColorProvider";
import { MongoDBHandledConnection } from "../../../../../db/mongodb/MongoDBHandledConnection";
import { MongoDBModelObjectsProvider } from "../common/MongoDBModelObjectsProvider";
import { NameBuilder } from "re/dist/model/provider/NameBuilder";
import { NestedDocumentStructureRegistry } from "../common/NestedDocumentStructureRegistry";
import { OtherObjectsProvider } from "../common/OtherObjectsProvider";
import { ParentProcesNotification } from "../../../ParentProcessNotification";
import { ReferenceCollectionFinder } from "../../../re/ReferenceCollectionFinder";
import { TablesProvider } from "../common/table/TablesProvider";

export class BSONModelBuilderFactory {
  public createBuilder(
    connection: MongoDBHandledConnection,
    reverseOptions: ReverseOptions,
    collections: CollectionInfo[],
    knownIdRegistry: KnownIdRegistry
  ): ModelBuilder {
    const namesRegistry = new NamesRegistry(
      new NameBuilder(new ContainerNameProvider())
    );
    const modelDescriptionProvider = new ModelDescriptionProvider(
      namesRegistry,
      reverseOptions
    );
    const nestedDocumentRegistry = new NestedDocumentStructureRegistry();
    const datatypeProvider = new BSONDatatypeProvider(
      new BSONNestedDocumentProvider(namesRegistry),
      nestedDocumentRegistry
    );
    const parentProcessUINotification = new ParentProcesNotification("MONGODB");
    const relationRegistry = new BSONRelationRegistry(
      new ReferenceCollectionFinder(
        connection.getDb(),
        collections,
        parentProcessUINotification
      ),
      reverseOptions
    );
    const tablesProvider = new TablesProvider(
      collections,
      nestedDocumentRegistry,
      new BSONTableDetailProviderFactory(
        connection.getDb(),
        reverseOptions,
        relationRegistry,
        datatypeProvider,
        parentProcessUINotification
      ),
      new DataProgressProvider(
        connection.getDb(),
        collections,
        reverseOptions,
        parentProcessUINotification
      ),
      namesRegistry
    );

    const modelWarningsProvider = new WarningsProvider();

    const relationsProvider = new BSONRelationsProvider(
      relationRegistry,
      modelWarningsProvider
    );

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
      modelWarningsProvider,
      new NotesProvider(namesRegistry, knownIdRegistry),
      new LinesProvider(namesRegistry, knownIdRegistry),
      new LayoutUpdateDiagramsProvider(namesRegistry, knownIdRegistry),
      knownIdRegistry
    );
  }
}
