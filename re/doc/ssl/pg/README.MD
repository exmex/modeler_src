# PostgreSQL SSL/X509
To support SSL in PostgreSQL follow these steps:

1. Install OpenSSL utility
2. Build server certificates
3. Build client certificates
4. Update postgresql.conf
5. Update pg_hba.conf
6. Docker-compose sample
7. Heroku
8. DBeaver 
9. psql

## 1. Install OpenSSL utility
https://wiki.openssl.org/index.php/Binaries

Ubuntu: 

```
apt-get update
```

```
apt-get install openssl
```

## 2. Build server certificate
1. Create a server key

```
openssl genrsa -des3 -out server.key 2048
```

2. Remove passphrase question

```
openssl rsa -in server.key -out server.key
```

3. Limit privileges for only reading

```
chmod 400 server.key
```

4. Set owner as database user

```
chown postgres.postgres server.key
```

5. Create server certificate

For proper work of certificate we need to specify CN of certificate. The CN could be domain name of server (e.g. dns1.registrar-servers.com) or localhost.

```
openssl req -new -key server.key -days 3650 -out server.crt -x509 -subj '/C=CA/ST=British Columbia/L=Comox/O=TheBrain.ca/CN=localhost/emailAddress=info@thebrain.ca'
```

6. Create root certifcate

We are creating self signed certificate so we just copy the server certificate:
   
```
cp server.crt root.crt
```

## 3. Build client certificate
1. Create a client key

```
openssl genrsa -des3 -out postgresql.key 2048
```

2. Remove passphrase question

```
openssl rsa -in postgresql.key -out postgresql.key
```

3. Create certificate signing request (CSR)

The user is authenticated by comparing CN with db user name so the CN must be the same as the db user name.

```
openssl req -new -key postgresql.key -out postgresql.csr -subj '/C=CA/ST=British Columbia/L=Comox/O=TheBrain.ca/CN=postgres'
```

5. Create a signed client 

```
openssl x509 -req -in postgresql.csr -CA root.crt -CAkey server.key -out postgresql.crt -CAcreateserial
```

## 4. Update postgresql.conf
The SSL is enabled by changing the postgresql.conf. Parameters ssl = on and certificates need to be uncommented and updated.

```
ssl = on
ssl_ca_file = 'root.crt'
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
ssl_ciphers = 'HIGH:MEDIUM:+3DES:!aNULL' # allowed SSL ciphers
ssl_prefer_server_ciphers = on
```

## 5. Update pg_hba.conf
There are 2 ways how to use the SSL. 

1. To encrypt communication between server and client change the type of connection from `host` to `hostssl`.
3. To force user to authenticate with client certificate change the method to `cert clientcert=1`.

Sample:

```
TYPE  DATABASE        USER            ADDRESS                 METHOD

hostssl    all             all             0.0.0.0/0            cert clientcert=1
```

## 6. Docker-compose sample
docker-compose:
```
docker-compose
  pg13_ssl:
    image: postgres:13-alpine
    container_name: pg130_ssl
    restart: always
    command: >
      -c ssl=on 
      -c ssl_ca_file=/var/lib/postgresql/root.crt
      -c ssl_cert_file=/var/lib/postgresql/server.crt
      -c ssl_key_file=/var/lib/postgresql/server.key
      -c hba_file=/etc/postgres/pg_hba.conf
    environment:
      - POSTGRES_PASSWORD=test
    volumes:
      - type: bind
        source: ./docker-compose/ssl-certs/pg/root.crt
        target: /var/lib/postgresql/root.crt
      - type: bind
        source: ./docker-compose/ssl-certs/pg/server.crt
        target: /var/lib/postgresql/server.crt
      - type: bind
        source: ./docker-compose/ssl-certs/pg/server.key
        target: /var/lib/postgresql/server.key
      - type: bind
        source: ./docker-compose/config/pg/pg_hba.conf
        target: /etc/postgres/pg_hba.conf
    ports:
      - 5130:5432
    networks:
      - test-net2222
```

pg_hba.conf:
```pg_hba.conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# "local" is for Unix domain socket connections only
local   all             all                                     trust
# IPv4 local connections:
hostssl    all             all             0.0.0.0/0            cert clientcert=1
```

Make server-key readable from docker
There are problems with privileges:

**private key file "/var/lib/postgresql/server.key" must be owned by the database user or root**

The server.key must be owned by user postgres(70) with limited 600 privileges. To fix it run these commands (Ubuntu):

```bash
sudo chown 70:70 server.key
sudo chmod 600 server.key
```

## 7. Heroku
Heroku PostgreSQL uses the self-signed certificate that is not available. 
For proper working disable the option `rejectUnauthorized` in the connection options. 
The certificate will not be validated but the connection will work.

## 8. DBeaver
The DBeaver app is not able to use the postgressql.key. To fix the problem generate pk8 unprotected certificate.

```
openssl pkcs8 -topk8 -inform PEM -outform DER -nocrypt -in postgresql.key -out postgresql.unprotected.pk8
```

## 9. psql
The psql has to be run with these parameters:

```
psql "sslmode=require port=<port> host=<host> dbname=<dbname> user=<user> sslcert=<path_to_client_crt> sslkey=<path_to_client_key> sslrootcert=<path_to_root_crt>"
```
