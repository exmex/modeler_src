import { ClassConnection } from "../../classes/class_connection";

export class ClassConnectionPG extends ClassConnection {
  constructor(
    id,
    name,
    desc,
    type,
    database,
    db,
    server,
    port,
    user,
    password,
    sshEnabled,
    sshhost,
    sshport,
    sshusername,
    sshpassword,
    sshprivatekey,
    sshpassphrase,
    includeSchema,
    parseData,
    noLimit,
    dataLimit,
    sslEnabled,
    sslRejectUnauthorized,
    sslCA,
    sslCert,
    sslKey,
    sslPassPhrase,
    sslServerName
  ) {
    super(id, name, desc, type, database);
    this.server = server;
    this.port = port;
    this.db = db;
    this.user = user;
    this.password = password;
    this.sshEnabled = sshEnabled;
    this.sshhost = sshhost;
    this.sshport = sshport;
    this.sshusername = sshusername;
    this.sshpassword = sshpassword;
    this.sshprivatekey = sshprivatekey;
    this.sshpassphrase = sshpassphrase;
    this.includeSchema = includeSchema;
    this.parseData = parseData;
    this.noLimit = noLimit;
    this.dataLimit = dataLimit;
    this.sslEnabled = sslEnabled;
    this.sslRejectUnauthorized = sslRejectUnauthorized;
    this.sslCA = sslCA;
    this.sslCert = sslCert;
    this.sslKey = sslKey;
    this.sslPassPhrase = sslPassPhrase;
    this.sslServerName = sslServerName;
  }
}
