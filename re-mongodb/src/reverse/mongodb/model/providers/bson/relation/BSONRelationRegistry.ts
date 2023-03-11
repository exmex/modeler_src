import { ReferenceSearch, ReverseOptions } from "re";

import { BSONDocument } from "../../../../re/bson/BSONDocument";
import { BSONField } from "../../../../re/bson/BSONField";
import { BSONRelationInfo } from "./BSONRelationInfo";
import { ReferenceCollectionFinder } from "../../../../re/ReferenceCollectionFinder";

export class BSONRelationRegistry {
    public relationInfos: BSONRelationInfo[] = [];

    public constructor(
        private referenceCollectionFinder: ReferenceCollectionFinder,
        private reverseOptions: ReverseOptions) { }

    public async register(value: { id: string }, document: BSONDocument, field: BSONField): Promise<void> {
        if (this.reverseOptions.referenceSearch !== ReferenceSearch.NONE) {
            const existingRelation: BSONRelationInfo | undefined = this.relationInfos
                .find((ri): boolean => ri.childDocument === document && ri.childField === field);

            if (existingRelation && this.reverseOptions.referenceSearch === ReferenceSearch.FIRST) {
                return;
            }

            const foundCollection = await this.referenceCollectionFinder
                .findWithHint(value, existingRelation);

            if (foundCollection) {
                const relationInfo = new BSONRelationInfo(foundCollection, document, field);
                if (!this.existsRelation(relationInfo)) {
                    this.relationInfos.push(relationInfo);
                }
            }
        }
    }
    private existsRelation(relationInfo: BSONRelationInfo): boolean {
        if (this.relationInfos.find((item): boolean => (item.equals(relationInfo)))) {
            return true;
        }

        return false;
    }
}
