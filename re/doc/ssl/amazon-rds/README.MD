# Amazon RDS SSL

## 1. Create RDS
## 2. Ensure that is accessible from your IP

Allow your IP in Security Groups

## 3. Download CA Certificate from amazon

Follow instructions from web page:
https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html

To get a certificate bundle that contains both the intermediate and root certificates, download from https://s3.amazonaws.com/rds-downloads/rds-combined-ca-bundle.pem.

## 4. Connect to DB

Set SSL and Reject Unauthorized on

Specify path to CA Certificate(rds-combined-ca-bundle.pem) on your disk 

## 5. Check is SSL is used

**MariaDB/MySQL**

`show status like 'Ssl_cipher';`

If result of this query is empty then the SSL is not used. If not then the value represents cipher used for communication.

**PostgreSQL**

`select * from pg_stat_ssl;`

Result contains information which pid uses SSL.

