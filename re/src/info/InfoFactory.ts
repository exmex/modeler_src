import { Info } from "./Info";
import { MessagePrettier } from "./MessagePrettier";
import { NoInfo } from "./NoInfo";
import { StoredInfo } from "./StoredInfo";

export class InfoFactory {
    public static create(filename: string | undefined, messagePrettier: MessagePrettier): Info {
        return filename ? new StoredInfo(filename, messagePrettier) : new NoInfo();
    }
}
