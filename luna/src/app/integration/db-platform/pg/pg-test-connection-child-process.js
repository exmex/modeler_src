const { ActiveSsh, NoSsh, NoSsl, ActiveSsl } = require("re");

const { PgTestConnection } = require("re-pg");

const server = process.argv[2];
const db = process.argv[3];
const user = process.argv[4];
const password = process.argv[5];
const infoFilename = process.argv[6];
const sshEnabled = process.argv[7];
const sshhost = process.argv[8];
const sshport = process.argv[9];
const sshusername = process.argv[10];
const sshpassword = process.argv[11];
const sshprivatekey = process.argv[12];
const sshpassphrase = process.argv[13];
const sslEnabled = process.argv[14];
const sslRejectUnauthorized = process.argv[15];
const sslCA = process.argv[16];
const sslCert = process.argv[17];
const sslKey = process.argv[18];
const sslPassPhrase = process.argv[19];
const sslServerName = process.argv[20];
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
  const reverseEngineering = new PgTestConnection(
    server,
    db,
    user,
    ssh,
    ssl,
    password,
    infoFilename
  );
  await reverseEngineering.run();
})();
