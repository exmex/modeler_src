import { ModelTypes } from "../../enums/enums";

export function initNewUndefinedProperties(connection) {
  return initNewUndefinedMongoDBReferenceSearch(
    //
    initNewUndefinedMongoDBLimit(
      //
      initNewUndefinedMongoDBSource(
        //
        initNewUndefinedMongoDBTlsEnabled(
          //
          initNewUndefinedSslEnabled(
            //
            initNewUndefinedSshEnabled(
              //
              initNewUndefinedLimit(connection)
            )
          )
        )
      )
    )
  );
}

function initNewUndefinedMongoDBReferenceSearch(connection) {
  return connection.type === ModelTypes.MONGODB &&
    connection.referenceSearch === undefined
    ? { ...connection, referenceSearch: "first" }
    : connection;
}

function initNewUndefinedMongoDBLimit(connection) {
  return connection.type === ModelTypes.MONGODB &&
    connection.noLimit === undefined
    ? { ...connection, dataLimit: 1000, noLimit: false }
    : connection;
}

function initNewUndefinedMongoDBSource(connection) {
  return connection.type === ModelTypes.MONGODB &&
    connection.source === undefined
    ? { ...connection, source: "data" }
    : connection;
}

function initNewUndefinedMongoDBTlsEnabled(connection) {
  return connection.type === ModelTypes.MONGODB &&
    connection.tlsEnabled === undefined
    ? { ...connection, tlsEnabled: false }
    : connection;
}

function initNewUndefinedSslEnabled(connection) {
  return (connection.type === ModelTypes.MARIADB ||
    connection.type === ModelTypes.MYSQL ||
    connection.type === ModelTypes.PG) &&
    connection.sslEnabled === undefined
    ? { ...connection, sslEnabled: false }
    : connection;
}

function initNewUndefinedSshEnabled(connection) {
  return (connection.type === ModelTypes.MARIADB ||
    connection.type === ModelTypes.MYSQL ||
    connection.type === ModelTypes.PG ||
    connection.type === ModelTypes.MONGODB) &&
    connection.sshEnabled === undefined
    ? { ...connection, sshEnabled: !!connection.sshhost }
    : connection;
}

function initNewUndefinedLimit(connection) {
  return (connection.type === ModelTypes.MARIADB ||
    connection.type === ModelTypes.MYSQL ||
    connection.type === ModelTypes.PG) &&
    connection.parseData === undefined
    ? { ...connection, parseData: true, dataLimit: 1000, noLimit: false }
    : connection;
}
