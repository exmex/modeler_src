import { BSONDatatypeProvider } from "../column/BSONDatatypeProvider";
import { BSONDocument } from "../../../../re/bson/BSONDocument";
import { BSONDocumentParser } from "../../../../re/bson/BSONDocumentParser";
import { BSONRelationRegistry } from "../relation/BSONRelationRegistry";
import { BSONTableDetailProvider } from "./BSONTableDetailProvider";
import { Collection } from "../../../../../../db/mongodb/MongoDBHandledConnection";
import { Db } from "mongodb";
import { ParentProcesNotification } from "../../../../ParentProcessNotification";
import { ReverseOptions } from "re";
import { TableDetailProvider } from "../../common/table/TableDetailProvider";
import { TableDetailProviderFactory } from "../../common/table/TableDetailProviderFactory";

const REPORT_PROGRESS_EACH_DOCUMENTS = 1;
const BATCH_SIZE = 50;
export class BSONTableDetailProviderFactory
  implements TableDetailProviderFactory
{
  constructor(
    private db: Db,
    private reverseOptions: ReverseOptions,
    private relationRegistry: BSONRelationRegistry,
    private datatypeProvider: BSONDatatypeProvider,
    private progress: ParentProcesNotification
  ) {}

  public async build(
    collection: Collection
  ): Promise<TableDetailProvider | undefined> {
    const bsonDocument = await this.parseDocument(collection);
    return bsonDocument
      ? new BSONTableDetailProvider(
          collection,
          bsonDocument,
          this.datatypeProvider
        )
      : undefined;
  }

  private async parseDocument(
    collection: Collection
  ): Promise<BSONDocument | undefined> {
    try {
      const cursor = this.db
        .collection(collection.name)
        .find({})
        .limit(this.reverseOptions.sampleLimit)
        .batchSize(BATCH_SIZE);
      const rootBSONDocument = new BSONDocument(collection.name, true);
      let counter = 0;

      while (await cursor.hasNext()) {
        const data = await cursor.next();
        const parser = new BSONDocumentParser(
          data,
          rootBSONDocument,
          this.relationRegistry
        );
        await parser.parseDocument(true);
        counter++;
        if (counter % REPORT_PROGRESS_EACH_DOCUMENTS === 0) {
          this.progress.sendPartProgressChange(collection.name, counter);
        }
      }
      console.log(`\t\tDocuments parsed: ${counter}`);
      return rootBSONDocument;
    } catch (err) {
      console.log(`\t\tDocuments not accessible: ${err}`);
      return undefined;
    }
  }
}
