import { BSONDocument } from "./BSONDocument";
import { BSONDocumentParser } from "./BSONDocumentParser";
import { BSONRelationRegistry } from "../../model/providers/bson/relation/BSONRelationRegistry";
import { Db } from "mongodb";
import { ReverseOptions } from "re";

export class BSONStructureBuilder {
  private db: Db;
  private reverseOptions: ReverseOptions;
  private relationRegistry: BSONRelationRegistry;

  public constructor(
    db: Db,
    reverseOptions: ReverseOptions,
    relationRegistry: BSONRelationRegistry
  ) {
    this.db = db;
    this.reverseOptions = reverseOptions;
    this.relationRegistry = relationRegistry;
  }

  public async build(collectionName: string): Promise<BSONDocument> {
    const cursor = this.db
      .collection(collectionName)
      .find({})
      .limit(this.reverseOptions.sampleLimit);
    const rootBSONDocument = new BSONDocument(`${collectionName}`, true);
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
    }
    console.log(`\t\tDocuments parsed: ${counter}`);
    return rootBSONDocument;
  }
}
