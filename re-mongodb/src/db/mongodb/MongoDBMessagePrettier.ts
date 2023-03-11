import { MessagePrettier } from "re";

export class MongoDBMessagePrettier implements MessagePrettier {
  public pretty(message: string): string {
    if (
      message.startsWith(
        "Cannot read properties of undefined (reading 'getPrivatePEM')"
      )
    ) {
      return `SSH connection failed. Check passphrase.`;
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
    } else if (message.startsWith("Server selection timed out after")) {
      return `The connection has been timed out after ${message
        .split(" ")[5]
        .trim()} ms.\nPlease check if the URL is correct or you can try enabling Direct Connection on the Server tab.`;
    } else if (
      message.startsWith("All configured authentication methods failed")
    ) {
      return `SSH Authentication failed. Please check user name or password.`;
    } else if (message.startsWith("connect ECONNREFUSED ")) {
      return `Connection refused by server (${message.substring(
        21
      )}).\nPlease check if the host or port are correct.`;
    } else if (
      message.startsWith("(SSH) Channel open failure: Connection refused")
    ) {
      return `Connection refused. Please check host and port of the MongoDB database.`;
    } else if (
      message.startsWith("command listDatabases requires authentication")
    ) {
      return `Current user is not privileged to list database. Please check if user doesn't need other authentication.`;
    } else if (message.startsWith("not authorized on ")) {
      return `Current user is not privileged to work with selected database. Please check if user doesn't need other authentication.`;
    } else if (message.startsWith("user is not allowed ")) {
      return `The ${message}. Please specify the database name manually or add the privilege to the user.`;
    } else if (
      message.startsWith("Unallowed argument in listDatabases command: ")
    ) {
      return `Current user is not privileged to work with selected database. Please add listDatabases privilege for the user and database.`;
    } else if (`Invalid database specified ''`) {
      return `${message}. Make sure Auth.Db. on the Authentication tab is set correctly.`;
    }

    return message;
  }
}
