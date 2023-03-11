import { ClassConnection } from "../../classes/class_connection";

export class ClassConnectionMySQLFamily extends ClassConnection {
  constructor(
    id,
    name,
    desc,
    type,
    database,
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
    this.user = user;
    this.password = password;
    this.sshEnabled = sshEnabled;
    this.sshhost = sshhost;
    this.sshport = sshport;
    this.sshusername = sshusername;
    this.sshpassword = sshpassword;
    this.sshprivatekey = sshprivatekey;
    this.sshpassphrase = sshpassphrase;
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
