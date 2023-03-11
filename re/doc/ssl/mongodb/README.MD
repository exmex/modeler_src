# MongoDB SSL
To support SSL in MongoDB follow these steps:

1. Install OpenSSL utility
2. Generate CA certificates
3. Generate server certificates
4. Generate client certificates
5. Update Docker start parameters (optinal)
6. mongod/mongo SSL (optional)


## 1. Install OpenSSL utility
https://wiki.openssl.org/index.php/Binaries

Ubuntu: 

```
apt-get update
```

```
apt-get install openssl
```

## 2. Generate CA certificates
```
openssl req -nodes -x509 -newkey rsa:2048 -keyout ca.key -out ca.crt -subj "/C=AU/ST=NSW/L=Sydney/O=MongoDB/OU=root/CN=foo/emailAddress=kevinadi@mongodb.com"
```


## 3. Generate server cert to be signed
1. Generate CSR

```
openssl req -nodes -newkey rsa:2048 -keyout server.key -out server.csr -subj "/C=AU/ST=NSW/L=Sydney/O=MongoDB/OU=server/CN=localhost/emailAddress=kevinadi@mongodb.com"
```

2. Sign CSR and generate certificate

```
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt
```

3. Generate server PEM file

```
cat server.key server.crt > server.pem
```


## 4. Generate client cert to be signed
1. Generate CSR and key

```
openssl req -nodes -newkey rsa:2048 -keyout client.key -days 3650 -out client.csr -subj "/C=AU/ST=NSW/L=Sydney/O=MongoDB/OU=client/CN=john/emailAddress=kevinadi@mongodb.com"
```

2. Sign CSR and generate certificate

```
openssl x509 -req -in client.csr -CA ca.crt -CAkey ca.key -CAserial ca.srl -out client.crt
```

3. Generate client PEM file

```
cat client.key client.crt > client.pem
```

4. Create clientPFX file (for Java, C#, etc) (optional)

```
openssl pkcs12 -inkey client.key -in client.crt -export -out client.pfx
```


## 5. Docker-compose sample

```
docker-compose
  mongo_ssl:
    image: mongo
    container_name: mongo_ssl
    command: --tlsMode requireTLS --tlsCertificateKeyFile /etc/certs/server.pem --tlsCAFile /etc/certs/ca.crt
    volumes:
      - type: bind
        source: ./docker-compose/ssl-certs/mongodb
        target: /etc/certs
    restart: always
    ports:
      - 37019:27017
    networks:
      - test-net2222

```
## 6. mongod/mongo SSL execution

1. Start mongod with SSL

```
mkdir -p data/db
```

```
mongod --sslMode requireSSL --sslPEMKeyFile server.pem --sslCAFile ca.crt --dbpath data/db --logpath data/mongod.log --fork
```

2. Connect to mongod with SSL

```
mongo --ssl --sslCAFile ca.crt --sslPEMKeyFile client.pem --host `hostname -f`
```