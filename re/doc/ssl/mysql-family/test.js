const fs = require("fs");
const mysql = require("mariadb");

(async () => {
  const c = {
    database: undefined,
    host: "34.116.243.134",
    password: "root",
    port: 3306,
    user: "root",
    connectTimeout: 3000,
    ssl: {
      ca: fs.readFileSync("/home/test/Downloads/server-ca.pem"),
      cert: fs.readFileSync("/home/test/Downloads/client-cert.pem"),
      key: fs.readFileSync("/home/test/Downloads/client-key.pem"),
      rejectUnauthorized: true
      //            servername: 'endless-bonus-296621:my'
    }
  };

  var connection = await new Promise((r, r1) => r(mysql.createConnection(c)));

  const x = await connection.query(`show variables like '%require%'`);
  x.forEach((result) => {
    console.log(`${result.Variable_name}\t\t\t${result.Value}`);
  });

  const x2 = await connection.query(`SELECT SUBSTRING_INDEX(USER(),'@',-1)`);
  x2.forEach((result) => {
    console.log(`${result.Variable_name}\t\t\t${result.Value}`);
  });

  const results = await connection.query(`SHOW STATUS LIKE 'Ssl_cipher'`);
  results.forEach((result) => {
    console.log(`${result.Variable_name}\t\t\t${result.Value}`);
  });

  connection.end();
})();
