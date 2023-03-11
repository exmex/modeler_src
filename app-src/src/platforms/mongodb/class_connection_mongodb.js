import { ClassConnection } from "../../classes/class_connection";

export class ClassConnectionMongoDb extends ClassConnection {
  constructor(
    id,
    name,
    desc,
    type,
    database,
    url,
    sshEnabled,
    sshhost,
    sshport,
    sshusername,
    sshpassword,
    sshprivatekey,
    sshpassphrase,
    authtype,
    authuser,
    authpassword,
    authsource,
    noLimit,
    dataLimit,
    source,
    referenceSearch,
    tlsEnabled,
    tlsCAFile,
    tlsCertificateKeyFile,
    tlsCertificateKeyFilePassword,
    directConnection,
    retryWrites,
    tlsAllowInvalidHostnames
  ) {
    super(id, name, desc, type, database);
    this.url = url;
    this.sshEnabled = sshEnabled;
    this.sshhost = sshhost;
    this.sshport = sshport;
    this.sshusername = sshusername;
    this.sshpassword = sshpassword;
    this.sshprivatekey = sshprivatekey;
    this.sshpassphrase = sshpassphrase;
    this.authtype = authtype;
    this.authuser = authuser;
    this.authpassword = authpassword;
    this.authsource = authsource;
    this.noLimit = noLimit;
    this.dataLimit = dataLimit;
    this.source = source;
    this.referenceSearch = referenceSearch;
    this.tlsEnabled = tlsEnabled;
    this.tlsCAFile = tlsCAFile;
    this.tlsCertificateKeyFile = tlsCertificateKeyFile;
    this.tlsCertificateKeyFilePassword = tlsCertificateKeyFilePassword;
    this.directConnection = directConnection,
    this.retryWrites = retryWrites,
    this.tlsAllowInvalidHostnames = tlsAllowInvalidHostnames
  }
}

export const ReferenceSearchValue = {
  ALL: "all",
  NONE: "none",
  FIRST: "first"
};
