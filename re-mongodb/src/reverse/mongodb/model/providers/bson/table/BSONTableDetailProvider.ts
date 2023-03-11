import { Collection } from "../../../../../../db/mongodb/MongoDBHandledConnection";
import { BSONDocument } from "../../../../re/bson/BSONDocument";
import { CollectionNameProvider } from "../../common/table/CollectionNameProvider";
import { ColumnsProvider } from "../../common/table/ColumnsProvider";
import { DescriptionProvider } from "../../common/table/DescriptionProvider";
import { IdProvider } from "../../common/table/IdProvider";
import { TableDetailProvider } from "../../common/table/TableDetailProvider";
import { BSONColumnsProvider } from "../column/BSONColumnsProvider";
import { BSONDatatypeProvider } from "../column/BSONDatatypeProvider";
import { BSONCollectionNameProvider } from "./BSONCollectionNameProvider";
import { BSONIdProvider } from "./BSONIdProvider";

export class BSONTableDetailProvider extends TableDetailProvider {

    constructor(collection: Collection, private document: BSONDocument, private datatypeProvider: BSONDatatypeProvider) {
        super(collection);
    }

    public getDescriptionProvider(): DescriptionProvider {
        return {
            provide() {
                return "";
            }
        }
    }

    public getCollectionNameProvider(): CollectionNameProvider {
        return new BSONCollectionNameProvider(this.document);
    }

    public getIdProvider(): IdProvider {
        return new BSONIdProvider(this.document);
    }

    public getColumnsProvider(): ColumnsProvider {
        return new BSONColumnsProvider(this.datatypeProvider, this.document);
    }
}