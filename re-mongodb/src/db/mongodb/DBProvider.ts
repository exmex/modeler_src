import { Db, Admin } from "mongodb";

export interface DbProvider {
    getDb(): Db;
    admin(): Admin;
}