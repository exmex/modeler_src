import { Admin, CollectionInfo, Db, MongoClient } from "mongodb";
import { Features, HandledConnection, Platform } from "re";

import { DbProvider } from "./DBProvider";
import { MongoDBFeatures } from "./MongoDBFeatures";

export interface Collection {
  options: {
    collation: string;
    capped: boolean;
    max: number;
    size: number;
    validationLevel: string;
    validationAction: string;
    validator: any;
  };
  name: string;
  indexes: any[];
}

export interface MongoDBHandledConnection
  extends HandledConnection<MongoDBFeatures>,
  DbProvider {
  getCollections(): Promise<CollectionInfo[]>;
}

export class MongoDBHandledConnectionImpl implements MongoDBHandledConnection {
  public constructor(
    private client: MongoClient,
    private db: Db,
    private auth: boolean
  ) { }

  public async getServerPlarform(): Promise<Platform> {
    return Platform.MONGODB;
  }

  public getFeatures(): Promise<Features> {
    return Promise.resolve(new MongoDBFeatures());
  }

  public async getServerVersion(): Promise<string> {
    return "";
  }

  public async getServerDescription(): Promise<string> {
    return "MongoDB";
  }

  public admin(): Admin {
    return this.db.admin();
  }

  public getDb(): Db {
    return this.db;
  }

  public async close(): Promise<void> {
    await this.client.close();
  }

  public async getCollections(): Promise<CollectionInfo[]> {
    if (this.auth) {
      const collectionsCursor = await this.db.command({
        listCollections: 1,
        nameOnly: true,
        authorizedCollections: true,
      });
      const collectionsData = collectionsCursor.cursor.firstBatch.map(
        ({ name }: { name: string }) => ({
          name,
          options: {
            collation: "",
            capped: false,
            max: 0,
            size: 0,
            validationLevel: "",
            validationAction: "",
          },
          indexes: [] as any[],
        })
      );

      return Promise.all(
        collectionsData.map(async (collection: any) => {
          return { ...collection, indexes: await this.getIndexes(collection) };
        })
      );
    }
    const collections = await this.db.listCollections().toArray();
    return Promise.all(
      collections.map(async (collection: any) => {
        return { ...collection, indexes: await this.getIndexes(collection) };
      })
    );
  }

  private async getIndexes(collection: any) {
    try {
      return await this.db.collection(collection.name).indexes({ full: true });
    } catch (e) {
      return [];
    }
  }
}
