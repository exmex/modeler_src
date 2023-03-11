export interface SQLiteIndexMetadata {
    id: string;
    name: string;
    unique: boolean;
    columns: SQLiteIndexColumnMetadata[];
    expression?: string;
}

export interface SQLiteIndexColumnMetadata {
    id: string,
    name: string,
    asc: boolean,
    desc: boolean,
    collation?: string;
    expression?: string;
}