import {
  MongoDBHandledConnection,
  MongoDBHandledConnectionImpl
} from "./MongoDBHandledConnection";

import { Auth } from "./auth";
import { ConnectionProvider } from "re";
import { MongoClient } from "mongodb";
import { MongoDBFeatures } from "./MongoDBFeatures";
import { MongoDBTls } from "./tls/mongodb-tls";
import { MongoDBTlsAdapter } from "./tls/mongodb-tls-adapter";

export class MongoDBConnectionProvider
  implements ConnectionProvider<MongoDBFeatures, MongoDBHandledConnection>
{
  public constructor(
    private tls: MongoDBTls,
    private url: string,
    private timeout: number,
    private directConnection: boolean,
    private retryWrites: boolean,
    private auth: Auth,
    private database: string
  ) {}

  public async createConnection(): Promise<MongoDBHandledConnection> {
    const authDetails = this.auth.provide();
    const tlsAdapter = new MongoDBTlsAdapter(this.tls);
    const options = {
      retryWrites: this.retryWrites,
      serverSelectionTimeoutMS: this.timeout,
      noDelay: true,
      keepAliveInitialDelay: this.timeout,
      directConnection: this.directConnection,
      ...authDetails,
      ...tlsAdapter.provide()
    };
    console.log("*****************************");
    console.log(options);
    console.log("*****************************");
    const client = await MongoClient.connect(this.url, options);
    console.log("******  CONNECTED  **********");

    return new MongoDBHandledConnectionImpl(
      client,
      client.db(this.database),
      !!authDetails.auth
    );
  }
}
