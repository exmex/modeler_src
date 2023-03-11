import { MessagePrettier } from "re";

export class JSONSchemaMessagePrettier implements MessagePrettier {
    public pretty(message: string): string {
        return message;
    }
}
