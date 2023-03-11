import { Category, KnownIdRegistry, ReverseEngineer } from "re";

import { BSONModelBuilderFactory } from "./model/providers/bson/BSONModelBuilderFactory";
import { MongoDBFeatures } from "../../db/mongodb/MongoDBFeatures";
import { MongoDBHandledConnection } from "../../db/mongodb/MongoDBHandledConnection";
import { MoonModelerModel } from "common";
import { ValidatorModelBuilderFactory } from "./model/providers/validator/ValidatorModelBuilderFactory";

export class MongoDBReverseEngineer extends ReverseEngineer<
  MongoDBFeatures,
  MongoDBHandledConnection
> {
  public getErrorCategory(error: Error): string {
    if (error.stack?.startsWith("MongoServerError: not authorized on ")) {
      return Category.AUTHENTICATION;
    }
    return super.getErrorCategory(error);
  }

  protected async prepareModel(
    connection: MongoDBHandledConnection
  ): Promise<MoonModelerModel> {
    const modelBuilder =
      this.reverseOptions.source === "validator"
        ? new ValidatorModelBuilderFactory().createBuilder(
            await connection.getCollections(),
            new KnownIdRegistry(false, false, undefined),
            this.reverseOptions
          )
        : new BSONModelBuilderFactory().createBuilder(
            connection,
            this.reverseOptions,
            await connection.getCollections(),
            new KnownIdRegistry(false, false, undefined)
          );
    return modelBuilder.build();
  }
}
