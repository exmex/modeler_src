import { Features } from "re";

export class MongoDBFeatures implements Features {
    public getMinimalSupportedVersion(): string {
        return "1.0";
    }

    public isSupported(): boolean {
        return true;
    }
}