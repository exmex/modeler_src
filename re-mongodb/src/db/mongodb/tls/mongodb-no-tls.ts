import { MongoDBTls, MongoDBTlsConfig } from "./mongodb-tls";

export class MongoDBNoTls implements MongoDBTls {

    public provide(): MongoDBTlsConfig {
        return {
        }
    }
}