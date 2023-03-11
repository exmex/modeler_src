import { CollectionInfo } from "mongodb";
import { TableDetailProvider } from "./TableDetailProvider";

export interface TableDetailProviderFactory {
    build(collection: CollectionInfo): Promise<TableDetailProvider | undefined>;
}