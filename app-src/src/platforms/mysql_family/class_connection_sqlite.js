import { ClassConnection } from "../../classes/class_connection";

export class ClassConnectionSQLite extends ClassConnection {
  constructor(id, name, desc, type, database, filePath) {
    super(id, name, desc, type, database);
    this.filePath = filePath;
  }
}
