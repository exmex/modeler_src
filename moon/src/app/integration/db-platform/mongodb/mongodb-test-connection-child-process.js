const { NoSsh, ActiveSsh } = require("re");

const {
  MongoDBTestConnection,
  MongoDBActiveTls,
  MongoDBNoTls,
  NoAuth,
  DefaultAuth
} = require("re-mongodb");

const server = process.argv[2];
const infoFilename = process.argv[3];
const timeout = 5000;
const sshEnabled = process.argv[4];
const sshhost = process.argv[5];
const sshport = process.argv[6];
const sshusername = process.argv[7];
const sshpassword = process.argv[8];
const sshprivatekey = process.argv[9];
const sshpassphrase = process.argv[10];
const authtype = process.argv[11];
const authsource = process.argv[12];
const authuser = process.argv[13];
const authpassword = process.argv[14];
const tlsEnabled = process.argv[15] === "true";
const tlsCAFile = process.argv[16];
const tlsCertificateKeyFile = process.argv[17];
const tlsCertificateKeyFilePassword = process.argv[18];
const tlsAllowInvalidHostnames = process.argv[19] === "true";
const directConnection = process.argv[20] === "true";
const retryWrites = process.argv[21] === "true";

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
  const reverseEngineering = new MongoDBTestConnection(
    server,
    timeout,
    directConnection,
    retryWrites,
    ssh,
    tls,
    auth,
    infoFilename
  );
  await reverseEngineering.run();
})();
