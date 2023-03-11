import { Collection } from "../../../../../../db/mongodb/MongoDBHandledConnection";
import { CollectionNameProvider } from "../../common/table/CollectionNameProvider";
import { ColumnsProvider } from "../../common/table/ColumnsProvider";
import { DescriptionProvider } from "../../common/table/DescriptionProvider";
import { IdProvider } from "../../common/table/IdProvider";
import { TableDetailProvider } from "../../common/table/TableDetailProvider";
import { ValidatorCollectionNameProvider } from "./ValidatorCollectionNameProvider";
import { ValidatorColumnsProvider } from "../column/ValidatorColumnsProvider";
import { ValidatorDatatypeProvider } from "../column/ValidatorDatatypeProvider";
import { ValidatorDescriptionProvider } from "./ValidatorDescriptionProvider";
import { ValidatorProvider } from "../../common/table/ValidatorProvider";
import { ValidatorValidatorProvider } from "./ValidatorValidatorProvider";
import { v4 as uuidv4 } from "uuid";

export class ValidatorTableDetailProvider extends TableDetailProvider {
  constructor(
    collection: Collection,
    private datatypeProvider: ValidatorDatatypeProvider
  ) {
    super(collection);
  }

  public getDescriptionProvider(): DescriptionProvider {
    return new ValidatorDescriptionProvider(
      this.collection.options &&
        this.collection.options.validator &&
        this.collection.options.validator.$jsonSchema
    );
  }

  public getCollectionNameProvider(): CollectionNameProvider {
    return new ValidatorCollectionNameProvider(this.collection);
  }

  public getIdProvider(): IdProvider {
    return {
      provide() {
        return uuidv4();
      }
    };
  }

  public getColumnsProvider(): ColumnsProvider {
    return new ValidatorColumnsProvider(
      this.collection.options?.validator?.$jsonSchema,
      this.datatypeProvider,
      true
    );
  }

  public getValidatorProvider(): ValidatorProvider {
    return new ValidatorValidatorProvider(this.collection);
  }
}
