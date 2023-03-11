# Google Cloud SQL SSL

## 1. Create Instance
## 2. Ensure that is accessible from your IP

Allow your IP in Networking options

## 3. Download CA Certificate from Google Cloude SQL

Create client certificate and download

server-ca.pem
client-cert.pem
client-key.pem

## 4. Connect to DB

Set SSL and Reject Unauthorized **off**

Specify path to CA Certificate(server-ca.pem), Client certificate(client-cert.pem), Client key(client-key.pem) on your disk .

Server name is `<Project ID>:<Instance ID>` (e.d. endless-bonus-XXXXXX:pg13)

## 5. Check is SSL is used

**MySQL**

`show status like 'Ssl_cipher';`

If result of this query is empty then the SSL is not used. If not then the value represents cipher used for communication.

**PostgreSQL**

`select * from pg_stat_ssl;`

Result contains information which pid uses SSL.
