import { MessagePrettier } from "re";

export class SQLiteMessagePrettier implements MessagePrettier {
    public pretty(message: string): string {
        if (message.startsWith("file is not a database")) {
            return "The file was not recognized as a supported version of the SQLite database."
        }
        return message;
    }
}
