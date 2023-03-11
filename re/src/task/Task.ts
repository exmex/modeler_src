import { Features } from "../reverse/common/Features";
import { HandledConnection } from "../db/HandledConnection";
import { Info } from "../info/Info";

export const Category = {
  INTERNAL: "INTERNAL",
  CONNECTION: "CONNECTION",
  AUTHENTICATION: "AUTHENTICATION"
};

export interface Task<U extends Features, T extends HandledConnection<U>> {
  getErrorCategory(error: unknown): string;
  execute(connection: T, info: Info): Promise<void>;
}
