import { Features } from "../../reverse/common/Features";
import { HandledConnection } from "../HandledConnection";
import { QueryExecutor } from "../QueryExecutor";

export interface SQLHandledConnection<T extends Features> extends HandledConnection<T>, QueryExecutor {
}
