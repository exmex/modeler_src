import { CollectionInfo } from "mongodb";
import { ParentProcesNotification } from "../../../ParentProcessNotification";
import { ProgressProvider } from "../../../ProgressProvider";

export class ValidatorProgressProvider implements ProgressProvider {
    public constructor(private collections: CollectionInfo[], private progress: ParentProcesNotification) { }

    public async register(): Promise<void> {
        for (const collection of this.collections) {
            this.progress.registerPart(collection.name, 1)
        }
    }

}