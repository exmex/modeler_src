const { Client } = require('pg');
const fs = require('fs');

(async () => {
    const clientConfig = {
        host: `34.116.157.104`,
        port: 5432,
        user: 'postgres',
        password: 'postgres',
        database: "postgres",
        ssl: {
            ca: fs.readFileSync('/home/test/Downloads/pg/server-ca.pem'),
            cert: fs.readFileSync('/home/test/Downloads/pg/client-cert.pem'),
            key: fs.readFileSync('/home/test/Downloads/pg/client-key.pem'),
            requireAuthorization: true,
            servername: 'endless-bonus-296621:pg13'
        }
    }

    try {
        //        console.log(JSON.stringify(clientConfig));
        const client = new Client(clientConfig);
        await client.connect();
        const result = (await client
            .query(`select * from pg_stat_ssl`)).rows[0];
        console.log(result);

        const result1 = (await client
            .query(`SELECT * FROM pg_stat_activity a left join pg_stat_ssl b on a.pid = b.pid WHERE state = 'active'`)).rows[0];
        console.log(result1);

        const result2 = (await client
            .query(`create table c (a int)`)).rows[0];
        console.log(result2);
        // const result10 = (await client
        //     .query(`SET search_path TO 'test'`)).rows[0];
        // console.log(result10);

        // const result1 = (await client
        //     .query(`CREATE TABLE t1_table_comment(id int)`)).rows[0];
        // console.log(result1);



        // const result21 = (await client
        //     .query(`insert into t1_table_comment values(1)`)).rows[0];
        // console.log(result21);

        // const result2 = (await client
        //     .query(`select * from t1_table_comment`)).rows[0];
        // console.log(result2);

        setTimeout(async () => {
            await client.end();

        }, 10000);
    } catch (e) {
        console.log(e);
    }
})();