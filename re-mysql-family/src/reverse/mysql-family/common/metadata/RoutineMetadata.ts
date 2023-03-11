import { RoutineParameter } from "../generator/RoutineParameter";

export class RoutineMetadata {
    public type: string;
    public returnDatatype: string;
    public definer: string;
    public aggregate: boolean;
    public name: string;
    public deterministic: boolean;
    public sqlAccess: string;
    public sqlSecurity: string;
    public comment: string;
    public routineDefinition: string;
    public parameters: RoutineParameter[];

    public constructor(
        type: string,
        returnDatatype: string,
        definer: string,
        aggregate: boolean,
        name: string,
        deterministic: boolean,
        sqlAccess: string,
        sqlSecurity: string,
        comment: string,
        routineDefinition: string,
    ) {
        this.type = type;
        this.definer = definer;
        this.aggregate = aggregate;
        this.name = name;
        this.returnDatatype = returnDatatype;
        this.deterministic = deterministic;
        this.sqlAccess = sqlAccess;
        this.sqlSecurity = sqlSecurity;
        this.comment = comment;
        this.parameters = [];
        this.routineDefinition = routineDefinition;
    }
}
