import { CollectionInfo, Db, ObjectId } from "mongodb";

import { BSONRelationInfo } from "../model/providers/bson/relation/BSONRelationInfo";
import { ParentProcesNotification } from "../ParentProcessNotification";

export class ReferenceCollectionFinder {

    public constructor(private db: Db, private collections: CollectionInfo[], private progress: ParentProcesNotification) { }

    public async findWithHint(value: { id: string; }, existingRelation: BSONRelationInfo | undefined): Promise<string | undefined> {
        if (existingRelation) {
            const parentCollection = this.collections
                .find(collection => collection.name === existingRelation.parentCollection)
            if (parentCollection) {
                const item = await this.findReferencedCollectionName(value, parentCollection);
                if (item) {
                    return item;
                }
            }
        }
        return this.find(value);
    }

    public async find(value: { id: string }): Promise<string | undefined> {
        for (const collection of this.collections) {
            const item = await this.findReferencedCollectionName(value, collection);
            if (item) {
                return item;
            }

        }

        return undefined;
    }

    private async findReferencedCollectionName(
        value: { id: string }, collection: CollectionInfo): Promise<string | undefined> {
        const objectId = new ObjectId(value.id);
        try {
            const item = await this.db.collection(collection.name).findOne({ _id: objectId });
            if (item) {
                return Promise.resolve(collection.name);
            }
        } catch (e) {
            // limited access
        }
        this.progress.sendMissingReference();
        return Promise.resolve(undefined);
    }
}
