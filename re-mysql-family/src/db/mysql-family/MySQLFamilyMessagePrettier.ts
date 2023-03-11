import { MessagePrettier } from "re";

export class MySQLFamilyMessagePrettier implements MessagePrettier {
  public pretty(message: string): string {
    if (
      message.startsWith(
        "Cannot read properties of undefined (reading 'getPrivatePEM')"
      )
    ) {
      return `SSH connection failed. Check passphrase.`;
    } else if (
      message.startsWith("All configured authentication methods failed")
    ) {
      return `SSH connection failed. All configured authentication methods failed.`;
    } else if (
      message.startsWith("(SSH) Channel open failure: Connection refused")
    ) {
      return `SSH connection failed. Check database host and port.`;
    } else if (
      message.startsWith(
        "Cannot parse privateKey: Failed to generate information to decrypt key"
      )
    ) {
      return `SSH connection failed. Check passphrase.`;
    } else if (
      message.startsWith("Cannot read property 'getPrivatePEM' of undefined")
    ) {
      return `SSH connection failed. Check passphrase.`;
    } else if (
      message.startsWith("getaddrinfo ENOTFOUND localhost1 localhost1:104")
    ) {
      return `Address ${message
        .split(" ")[2]
        .trim()} not found.\nPlease check if the host is correct.`;
    } else if (message.startsWith("connect ECONNREFUSED ")) {
      return `Connection refused by server (${message.substring(
        21
      )}).\nPlease check if the host or port are correct.`;
    } else if (message.includes("SQLState:")) {
      return `${message.split(") ")[1].trim()}`;
    } else if (message.startsWith("ENOENT: ")) {
      return message.substring(8);
    }
    return message;
  }
}
