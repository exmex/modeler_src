import { HandledConnection } from "../db/HandledConnection";
import { Features } from "../reverse/common/Features";

export interface ConnectionProvider<
  U extends Features,
  T extends HandledConnection<U>
> {
  createConnection(hint: string): Promise<T>;
}
