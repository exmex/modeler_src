import { CommonColumnMetadata } from "re";

export interface MSSQLColumnMetadata extends CommonColumnMetadata {
  identity?: { seed_value: number; increment_value: number };
  definition?: string;
  isPersisted: boolean;
  datatypeSchema: string;
  isNotForReplication: boolean;
}
