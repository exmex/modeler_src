import { SourceMetadata } from "../provider/SourceMetadata";

export class SourceGenerator<T extends SourceMetadata> {
    public generate(metadata: T): string {
        return metadata._code;
    }
}