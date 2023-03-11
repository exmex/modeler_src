import { Admin, CollectionInfo, Db } from "mongodb";

import { MongoDBFeatures } from "./MongoDBFeatures";
import { MongoDBHandledConnection } from "./MongoDBHandledConnection";
import { Platform } from "re";
import { Server } from "net";

export class MongoDBSshHandledConnection implements MongoDBHandledConnection {
  private mongoDbConnection: MongoDBHandledConnection;
  private server: Server;

  public constructor(
    mongoDbConnection: MongoDBHandledConnection,
    server: Server
  ) {
    this.mongoDbConnection = mongoDbConnection;
    this.server = server;
  }

  public async getServerPlarform(): Promise<Platform> {
    return this.mongoDbConnection.getServerPlarform();
  }

  public getFeatures(): Promise<MongoDBFeatures> {
    return this.mongoDbConnection.getFeatures();
  }

  public getServerVersion(): Promise<string> {
    return Promise.resolve("");
  }

  public getServerDescription(): Promise<string> {
    return Promise.resolve("MongoDB");
  }

  public admin(): Admin {
    return this.mongoDbConnection.admin();
  }

  public getDb(): Db {
    return this.mongoDbConnection.getDb();
  }

  public async close(): Promise<void> {
    await this.mongoDbConnection.close();
    this.server.close();
  }

  public async getCollections(): Promise<CollectionInfo[]> {
    return this.mongoDbConnection.getCollections();
  }
}
