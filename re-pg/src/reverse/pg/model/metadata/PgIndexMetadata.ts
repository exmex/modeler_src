export interface PgIndexMetadata {
    id: string;
    name: string;
    unique: boolean;
    columns: {
        id: string,
        name: string,
        asc: boolean,
        desc: boolean,
        nulls_first: boolean,
        nulls_last: boolean,
        collation?: string;
        expression?: string;
    }[];
    expression?: string;
    options?: string[];
    tablespace?: string;
    comment?: string;
    storageParameters?: string[];
    using?: string;
}