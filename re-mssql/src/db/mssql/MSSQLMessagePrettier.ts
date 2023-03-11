import { MessagePrettier } from "re";

export class MSSQLMessagePrettier implements MessagePrettier {
  public pretty(message: string): string {
    return message;
  }
}
