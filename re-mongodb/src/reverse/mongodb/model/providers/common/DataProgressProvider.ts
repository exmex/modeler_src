import { CollectionInfo, Db } from "mongodb";

import { ParentProcesNotification } from "../../../ParentProcessNotification";
import { ProgressProvider } from "../../../ProgressProvider";
import { ReverseOptions } from "re";

export class DataProgressProvider implements ProgressProvider {
    public constructor(
        private db: Db,
        private collections: CollectionInfo[],
        private reverseOptions: ReverseOptions,
        private progress: ParentProcesNotification
    ) { }

    public async register(): Promise<void> {
        const estimatePromises = this.collections.map(collection => this.estimate(collection));
        await Promise.all(estimatePromises);
        this.progress.send();
    }


    private async estimate(collection: CollectionInfo) {
        let estimatedDocumentCount = this.reverseOptions.sampleLimit;
        try {
            estimatedDocumentCount = await this.db.collection(collection.name)
                .estimatedDocumentCount();
        } catch {
            // if there are no permissions
        }

        const documentsToParse = this.reverseOptions.sampleLimit !== 0
            ? Math.min(estimatedDocumentCount, this.reverseOptions.sampleLimit)
            : estimatedDocumentCount;
        this.progress.registerPart(

            collection.name,
            documentsToParse);
    }
}