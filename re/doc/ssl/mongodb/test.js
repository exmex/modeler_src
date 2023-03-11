const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient('mongodb://localhost:37019', {
    //tlsCAFile: `/home/test/dev/mm-re/docker-compose/ssl-certs/mongodb/ca.crt`,
    // tlsCertificateKeyFile: `/home/test/dev/mm-re/docker-compose/ssl-certs/mongodb/client.pem`,
    //    tlsCertificateKeyFilePassword: '10gen'
    tls: true,
    tlsInsecure: false,
    tlsAllowInvalidCertificates: false,
    tlsAllowInvalidHostnames: false
    /**
     * Relax TLS constraints, disabling validation
     * @default false
     */
    /**
     * Path to file with either a single or bundle of certificate authorities
     * to be considered trusted when making a TLS connection
     */
    /**
     * Path to the client certificate file or the client private key file;
     * in the case that they both are needed, the files should be concatenated
     */
    /**
     * The password to decrypt the client private key to be used for TLS connections
    /**
     * Specifies whether or not the driver should error when the server’s TLS certificate is invalid
     */
    /**
     * Specifies whether or not the driver should error when there is a mismatch between the server’s hostname
     * and the hostname specified by the TLS certificate
     */
});

// Connect validating the returned certificates from the server
client.connect(function (err) {
    client.close();
});