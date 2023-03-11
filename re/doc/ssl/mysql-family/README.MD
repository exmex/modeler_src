# MySQL/MariaDB SSL/X509
To support SSL in MySQL/MariaDB follow these steps:

1. Install OpenSSL utility
2. Build CA certificates
3. Build server certificates
4. Build client certificates
5. Update my.cnf
6. Update user to require certificate
7. UpdateDocker start parameters

## 1. Install OpenSSL utility
https://wiki.openssl.org/index.php/Binaries

Ubuntu: 

```
apt-get update
```

```
apt-get install openssl
```

## 2. Build CA certificate
1. Create CA Key
   
```
openssl genrsa 2048 > ca-key.pem
```

2. Create CA X509 Certificate

**Beware** of using CN localhost because for self-signed certificate it will throw validation error:

*self signed root cert can not be verified with openssl - error 18 at 0 depth lookup*

```
openssl req -new -x509 -nodes -days 365000 -key ca-key.pem -out ca-cert.pem -subj '/C=CA/ST=British Columbia/L=Comox/O=TheBrain.ca/CN=notlocalhost/emailAddress=info@thebrain.ca'
```

## 3. Build Server certificate
1. Create Server certificate

```
openssl req -newkey rsa:2048 -days 365000 -nodes -keyout server-key.pem -out server-req.pem -subj '/C=CA/ST=British Columbia/L=Comox/O=TheBrain.ca/CN=localhost/emailAddress=info@thebrain.ca'
```

2. Create Server certificate

```
openssl x509 -req -in server-req.pem -days 365000 -CA ca-cert.pem -CAkey ca-key.pem -set_serial 01 -out server-cert.pem
```

## 4. Build Client certificate
1. Create Client certificate

```
openssl req -newkey rsa:2048 -days 365000 -nodes -keyout client-key.pem -out client-req.pem -subj '/C=CA/ST=British Columbia/L=Comox/O=TheBrain.ca/CN=myuser'
```

2. Create Client certificate

```
openssl x509 -req -in client-req.pem -days 365000 -CA ca-cert.pem -CAkey ca-key.pem -set_serial 01 -out client-cert.pem
```

3. Verify Client certificate (optional)

```
openssl verify -CAfile ca-cert.pem server-cert.pem client-cert.pem
```

## 5. Update my.cnf

```
#ssl
ssl-ca=/etc/mysql/ssl/ca-cert.pem
ssl-cert=/etc/mysql/ssl/server-cert.pem
ssl-key=/etc/mysql/ssl/server-key.pem
require_secure_transport=ON
```

To specify in addition that clients are required to use encrypted connections, enable the require_secure_transport system variable.

## 6. Update server to require certificate

https://dev.mysql.com/doc/refman/5.7/en/alter-user.html - X509

```
CREATE USER 'dbuser3'@'%'  require X509
```

```
ALTER USER 'dbuser3'@'%' require X509
```


Exact issuer:


```
ALTER USER 'dbuser3'@'%'
  REQUIRE SUBJECT '/C=CA/ST=British Columbia/L=Comox/O=TheBrain.ca/CN=myuser';
```

Subject - Exact subject:

```
ALTER USER 'dbuser3'@'%'
  REQUIRE SUBJECT '/C=CA/ST=British Columbia/L=Comox/O=TheBrain.ca/CN=myuser'
  AND ISSUER '/C=CA/ST=British Columbia/L=Comox/O=TheBrain.ca/CN=notlocalhost/emailAddress=info@thebrain.ca';
```

Exact cipher:

```
ALTER USER 'jeffrey'@'localhost'
  REQUIRE CIPHER 'EDH-RSA-DES-CBC3-SHA';
```


## 7. Docker-compose sample


```
docker-compose
  mysql8_ssl:
    image: mysql:8.0
    container_name: mysql8_ssl
    command:
      [
        "mysqld",
        "--character-set-server=utf8mb4",
        "--collation-server=utf8mb4_general_ci",
        "--bind-address=0.0.0.0",
        "--require_secure_transport=ON",
        "--default_authentication_plugin=mysql_native_password",
        "--ssl-ca=/etc/certs/ca-cert.pem",
        "--ssl-cert=/etc/certs/client-cert.pem",
        "--ssl-key=/etc/certs/client-key.pem",
      ]
    ports:
      - "1801:3306"
    volumes:
      - type: bind
        source: ./docker-compose/ssl-certs/mysql-family
        target: /etc/certs
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: "root"
      MYSQL_ROOT_HOST: "%"
```

Make server-key readable from docker
```
sudo chmod 644 server-key.pem
```