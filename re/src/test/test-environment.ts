import { ConnectionProvider } from "../task/ConnectionProvider";
import { Features } from "../reverse/common/Features";
import { ReverseEngineering } from "../db/ReverseEngineering";
import { SQLHandledConnection } from "../db/sql/SQLHandledConnection";
import { Ssl } from "../db/ssl/Ssl";
import { TestConnection } from "../db/TestConnection";

export interface SshTunnel {
  host: string;
  port: number;
  username: string;
  password: string;
  privateKey: string;
  passphrase: string;
}

export interface ConnectionProperties {
  host: string;
  port: number;
  schema: string;
  user: string;
  database: string;
  password?: string;
}

export interface Environment<T extends Features> {
  connection: ConnectionProperties;
  adminConnection?: ConnectionProperties;
  outputFilename: string;
  version: T;
  ssl: Ssl;
  sshEnvironment?: SshEnvironment;
  sampleSize: number;
}

export interface SshEnvironment {
  sshTunnel: SshTunnel;
  directConnection: ConnectionProperties;
}

export abstract class TestEnvironment<
  T extends Features,
  U extends Environment<T>
  > {
  public abstract sshEnvironments: U[];
  public abstract environments: U[];
  public abstract sslEnvironments: U[];
  public abstract getSshDirectConnection(
    connection: ConnectionProperties,
    environment: U,
    useDatabase: boolean,
    useSchema: boolean
  ): ConnectionProvider<T, SQLHandledConnection<T>>;
  public abstract getSshTestConnection(
    connection: ConnectionProperties,
    environment: U,
    infoFilename: string
  ): TestConnection;
  public abstract getSshReverseEngineering(
    connection: ConnectionProperties,
    environment: U,
    infoFilename: string,
    outputFilename: string
  ): ReverseEngineering;

  public sshTunnel: SshTunnel = {
    host: "localhost",
    port: 2222,
    username: "test",
    password: "test",
    privateKey: "",
    passphrase: "",
  };
}
