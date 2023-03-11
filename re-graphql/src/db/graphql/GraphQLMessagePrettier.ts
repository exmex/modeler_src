import { MessagePrettier } from "re";

export class GraphQLMessagePrettier implements MessagePrettier {
    public pretty(message: string): string {
        if (message.startsWith("getaddrinfo ENOTFOUND ")) {
            return "Model could not be loaded.\n" +
                `Application was not able to connect to ${message.substring(22)}.\n` +
                `Please check if the host or port are correct.`;
        }
        if (message.startsWith("Request failed with status code 400")) {
            return "Model could not be loaded.\n" +
                "The server cannot or will not process the request due to an apparent client error (code 400).\n" +
                "Please check if the server supports introspection system (https://graphql.org/learn/introspection).";
        }
        if (message.startsWith("Request failed with status code 401")) {
            return "Model could not be loaded.\n" +
                "Authentication is required and has failed or has not yet been provided (code 401).";
        }
        if (message.startsWith("Request failed with status code 404")) {
            return "Model could not be loaded.\n" +
                "The requested resource could not be found (code 404).\n" +
                "Please check if the server supports introspection system (https://graphql.org/learn/introspection).";
        }
        if (message.startsWith("Request failed with status code 405")) {
            return "Model could not be loaded.\n" +
                "A request method is not supported for the requested resource (code 405).\n" +
                "Please check if the server supports introspection system (https://graphql.org/learn/introspection).";
        }
        return message;
    }
}
