import { Collection } from "../../../../../../db/mongodb/MongoDBHandledConnection";
import { CollectionNameProvider } from "../../common/table/CollectionNameProvider";

export class ValidatorCollectionNameProvider implements CollectionNameProvider {
    constructor(private collection: Collection) { }

    provide(): string {
        return this.collection.name;
    }
}