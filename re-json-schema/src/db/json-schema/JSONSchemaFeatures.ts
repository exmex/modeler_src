import { Features } from "re";

export class JSONSchemaFeatures implements Features {
    getMinimalSupportedVersion(): string {
        return "1.0";
    }
    isSupported(): boolean {
        return true;
    }
}