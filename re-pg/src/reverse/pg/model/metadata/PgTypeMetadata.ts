import { SourceMetadata } from "../provider/SourceMetadata";

export interface PgTypeMetadata extends SourceMetadata {
    _type: {
        typeoftype: string;
        default: string;
        collation: string;
        input: string;
        output: string;
        analyze: string;
        element: string;
        receive: string;
        storage: string;
        send: string;
        category: string;
        alignment: string;
        delimiter: string;
        preferred: string;
        typmod_in: string;
        collatable: boolean;
        typmod_out: string;
        passedbyvalue: boolean;
        internallength: number;
        subtype_diff: string;
        canonical: string;
        subtype_opclass: string;
        subtype: string;
        type: string;
        notnull: string;
        constraints: JSON;
        enum: string[];
    };
}