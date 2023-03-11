import { MessagePrettier } from "re";

export class PgMessagePrettier implements MessagePrettier {
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
    } else if (message.startsWith(`self signed certificate`)) {
      return (
        `Application was not able to connect.\n` +
        `The SSL/TLS is secured by self signed certificate.\n` +
        `Provide CA certificate or disable the "Reject Unauthorized" option.`
      );
    }
    if (message.endsWith(`SSL off`)) {
      return message.replace(
        `SSL off`,
        `without SSL/TLS. Enable SSL/TLS connection option.`
      );
    }
    if (message.startsWith("getaddrinfo ENOTFOUND ")) {
      return `Application was not able to connect to ${message.substring(
        22
      )}.\nPlease check if the host or port are correct.`;
    }
    return message;
  }
}
