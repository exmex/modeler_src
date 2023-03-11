const { ActiveSsh, NoSsh } = require("re");
const {
  MongoDBReverseEngineering,
  MongoDBNoTls,
  MongoDBActiveTls,
  DefaultAuth,
  NoAuth
} = require("re-mongodb");

const server = process.argv[2];
const database = process.argv[3];
const outputFilename = process.argv[4];
const infoFilename = process.argv[5];
const timeout = 5000;
const autolayout = true;
const sshEnabled = process.argv[6];
const sshhost = process.argv[7];
const sshport = process.argv[8];
const sshusername = process.argv[9];
const sshpassword = process.argv[10];
const sshprivatekey = process.argv[11];
const sshpassphrase = process.argv[12];
const authtype = process.argv[13];
const authsource = process.argv[14];
const authuser = process.argv[15];
const authpassword = process.argv[16];
const sampleSize = +process.argv[17];
const source = process.argv[18];
const referenceSearch = process.argv[19];
const tlsEnabled = process.argv[20] === "true";
const tlsCAFile = process.argv[21];
const tlsCertificateKeyFile = process.argv[22];
const tlsCertificateKeyFilePassword = process.argv[23];
const tlsAllowInvalidHostnames = process.argv[24] === "true";
const directConnection = process.argv[25] === "true";
const retryWrites = process.argv[26] === "true";
const originalModelFile = process.argv[27];
const connectionId = process.argv[28];
const connectionName = process.argv[29];

(async () => {
  const ssh =
    sshEnabled === "true"
      ? new ActiveSsh(
          sshhost,
          +sshport,
          sshusername,
          sshpassword,
          sshprivatekey,
          sshpassphrase
        )
      : new NoSsh();
  const auth =
    authtype === "Default" ||
    authtype === "SCRAM-SHA-1" ||
    authtype === "SCRAM-SHA-256"
      ? new DefaultAuth(
          authuser,
          authpassword,
          authsource,
          authtype.toUpperCase()
        )
      : new NoAuth();
  const tls =
    tlsEnabled === true
      ? new MongoDBActiveTls(
          undefined,
          undefined,
          tlsAllowInvalidHostnames,
          tlsCAFile,
          tlsCertificateKeyFile,
          tlsCertificateKeyFilePassword
        )
      : new MongoDBNoTls();

  const reverseEngineering = new MongoDBReverseEngineering(
    connectionId,
    connectionName,
    server,
    database,
    directConnection,
    retryWrites,
    ssh,
    tls,
    auth,
    timeout,
    outputFilename,
    autolayout,
    sampleSize,
    source,
    referenceSearch,
    infoFilename,
    originalModelFile
  );
  await reverseEngineering.run();
})();
