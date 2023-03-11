const { ActiveSsh, NoSsh, ActiveSsl, NoSsl } = require("re");
const { MariaDBReverseEngineering } = require("re-mysql-family");

const outputFilename = process.argv[2];
const server = process.argv[3];
const user = process.argv[4];
const database = process.argv[5];
const password = process.argv[6];
const infoFilename = process.argv[7];
const sshEnabled = process.argv[8];
const sshhost = process.argv[9];
const sshport = process.argv[10];
const sshusername = process.argv[11];
const sshpassword = process.argv[12];
const sshprivatekey = process.argv[13];
const sshpassphrase = process.argv[14];
const sampleSize = process.argv[15];
const sslEnabled = process.argv[16];
const sslRejectUnauthorized = process.argv[17];
const sslCA = process.argv[18];
const sslCert = process.argv[19];
const sslKey = process.argv[20];
const sslPassPhrase = process.argv[21];
const sslServerName = process.argv[22];
const originalModelFile = process.argv[23];
const connectionId = process.argv[24];
const connectionName = process.argv[25];
const timeout = 5000;
const autolayout = false;

(async () => {
  const ssh =
    sshEnabled === "true"
      ? new ActiveSsh(
          sshhost,
          sshport,
          sshusername,
          sshpassword,
          sshprivatekey,
          sshpassphrase
        )
      : new NoSsh();
  const ssl =
    sslEnabled === "true"
      ? new ActiveSsl(
          sslRejectUnauthorized === "true",
          sslCA,
          sslCert,
          sslKey,
          sslPassPhrase,
          sslServerName
        )
      : new NoSsl();
  const reverseEngineering = new MariaDBReverseEngineering(
    connectionId,
    connectionName,
    server,
    user,
    database,
    outputFilename,
    sampleSize,
    autolayout,
    ssh,
    ssl,
    timeout,
    password,
    infoFilename,
    originalModelFile
  );
  reverseEngineering.run();
})();
