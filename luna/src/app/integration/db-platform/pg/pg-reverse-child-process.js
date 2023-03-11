console.log("pg-re");
const { ActiveSsl, ActiveSsh, NoSsh, NoSsl } = require("re");

const { PgReverseEngineering } = require("re-pg");

const outputFilename = process.argv[2];
const server = process.argv[3];
const database = process.argv[4];
const schema = process.argv[5];
const user = process.argv[6];
const password = process.argv[7];
const infoFilename = process.argv[8];
const sshEnabled = process.argv[9];
const sshhost = process.argv[10];
const sshport = process.argv[11];
const sshusername = process.argv[12];
const sshpassword = process.argv[13];
const sshprivatekey = process.argv[14];
const sshpassphrase = process.argv[15];
const includeSchema = process.argv[16];
const sampleSize = process.argv[17];
const sslEnabled = process.argv[18];
const sslRejectUnauthorized = process.argv[19];
const sslCA = process.argv[20];
const sslCert = process.argv[21];
const sslKey = process.argv[22];
const sslPassPhrase = process.argv[23];
const sslServerName = process.argv[24];
const originalModelFile = process.argv[25];
const connectionId = process.argv[26];
const connectionName = process.argv[27];

const autolayout = false;

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
  const reverseEngineering = new PgReverseEngineering(
    connectionId,
    connectionName,
    server,
    database,
    schema,
    user,
    outputFilename,
    sampleSize,
    autolayout,
    ssh,
    ssl,
    password,
    infoFilename,
    includeSchema,
    originalModelFile
  );
  reverseEngineering.run();
})();
