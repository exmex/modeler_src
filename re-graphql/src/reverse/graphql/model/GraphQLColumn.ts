import { Field } from "../../../db/graphql/GraphQLSchemaParser";

export interface GraphQLColumn {
    name: string;
    datatype: string;
    pk: boolean;
    nn: boolean;
    list: boolean;
    isHidden: boolean;
    fieldArguments: string;
    fieldDirective: string;
    comment: string;
}

export class FakeIdGraphQLColumn {
    name: string = "FakeIdForInternalUse";
    datatype: string = "ID";
    pk: boolean = true;
    nn: boolean = true;
    list: boolean = true;
    isHidden: boolean = true;
    fieldArguments: string = "";
    fieldDirective: string = "";
    comment: string = "";
}

export class FieldGraphQLColumnAdapter {
    private _name: string;
    private _datatype: string;
    private _pk: boolean;
    private _nn: boolean;
    private _list: boolean;
    private _isHidden: boolean;
    private _fieldArguments: string;
    private _fieldDirective: string;
    private _comment: string;

    public constructor(field: Field, dataTypeLink: string, pk: boolean) {
        this._name = field.name;
        this._datatype = dataTypeLink;
        this._pk = pk;
        this._nn = field.required;
        this._list = field.array;
        this._isHidden = false;
        this._fieldArguments = field.args;
        this._fieldDirective = field.directive;
        this._comment = field.description;
    }

    public get name(): string {
        return this._name;
    }
    public get datatype(): string {
        return this._datatype;
    }
    public get pk(): boolean {
        return this._pk;
    }
    public get nn(): boolean {
        return this._nn;
    }
    public get list(): boolean {
        return this._list;
    }
    public get isHidden(): boolean {
        return this._isHidden;
    }
    public get fieldArguments(): string {
        return this._fieldArguments;
    }
    public get fieldDirective(): string {
        return this._fieldDirective;
    }
    public get comment(): string {
        return this._comment;
    }
}