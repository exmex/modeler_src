import { CappedProvider } from "./CappedProvider";
import { CollationProvider } from "./CollationProvider";
import { Collection } from "../../../../../../db/mongodb/MongoDBHandledConnection";
import { CollectionNameProvider } from "./CollectionNameProvider";
import { ColumnsProvider } from "./ColumnsProvider";
import { DescriptionProvider } from "./DescriptionProvider";
import { IdProvider } from "./IdProvider";
import { IndexesProvider } from "./IndexesProvider";
import { KeysProvider } from "./KeysProvider";
import { ValidatorProvider } from "./ValidatorProvider";

export abstract class TableDetailProvider {
    public constructor(protected collection: Collection) { }

    public abstract getCollectionNameProvider(): CollectionNameProvider;

    public abstract getIdProvider(): IdProvider;

    public abstract getColumnsProvider(): ColumnsProvider;

    public abstract getDescriptionProvider(): DescriptionProvider;

    public getKeysProvider(): KeysProvider {
        return new KeysProvider();
    }

    public getValidatorProvider(): ValidatorProvider {
        return new ValidatorProvider(this.collection);
    }

    public getCappedProvider() {
        return new CappedProvider(this.collection);
    }

    public getIndexesProvider() {
        return new IndexesProvider(this.collection);
    }

    public getCollationProvider() {
        return new CollationProvider(this.collection);
    }
}