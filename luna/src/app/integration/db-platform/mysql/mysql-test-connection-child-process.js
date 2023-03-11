const { ActiveSsh, NoSsh, ActiveSsl, NoSsl } = require("re");

const { MySQLTestConnection } = require("re-mysql-family");

const server = process.argv[2];
const user = process.argv[3];
const password = process.argv[4];
const infoFilename = process.argv[5];
const sshEnabled = process.argv[6];
const sshhost = process.argv[7];
const sshport = process.argv[8];
const sshusername = process.argv[9];
const sshpassword = process.argv[10];
const sshprivatekey = process.argv[11];
const sshpassphrase = process.argv[12];
const sslEnabled = process.argv[13];
const sslRejectUnauthorized = process.argv[14];
const sslCA = process.argv[15];
const sslCert = process.argv[16];
const sslKey = process.argv[17];
const sslPassPhrase = process.argv[18];
const sslServerName = process.argv[19];
const timeout = 5000;

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
  const reverseEngineering = new MySQLTestConnection(
    server,
    user,
    ssh,
    ssl,
    timeout,
    password,
    infoFilename
  );
  await reverseEngineering.run();
})();
