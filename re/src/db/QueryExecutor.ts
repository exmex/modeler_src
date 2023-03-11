export interface QueryExecutor {
  query(sql: string, values?: any): Promise<any>;
  exec(sql: string, values?: any): Promise<void>;
}
