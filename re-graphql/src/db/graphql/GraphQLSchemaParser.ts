import {
    DirectiveNode,
    DocumentNode,
    EnumTypeDefinitionNode,
    EnumValueDefinitionNode,
    FieldDefinitionNode,
    InterfaceTypeDefinitionNode,
    NamedTypeNode,
    ObjectTypeDefinitionNode,
    OperationDefinitionNode,
    ScalarTypeDefinitionNode,
    TypeNode,
    UnionTypeDefinitionNode
} from "graphql/language/ast";

export class GraphQLSchemaParser {
    private text: string;
    private documentNode: DocumentNode;

    public constructor(documentNode: DocumentNode, text: string) {
        this.text = text;
        this.documentNode = documentNode;
    }

    public getScalar(): Scalar[] {
        const scalars = this.documentNode.definitions
            .filter((document): boolean => document.kind === "ScalarTypeDefinition")
            .map((document): ScalarTypeDefinitionNode => (document as ScalarTypeDefinitionNode));

        return scalars.map((document: ScalarTypeDefinitionNode): Scalar => (
            {
                name: document.name ? document.name.value : "", code: document.loc ? this.text.substring(document.loc.start, document.loc.end) : "",
                directive: this.getDirectives(document.directives)
            }));
    }

    public getEnums(): Enum[] {
        const enums = this.documentNode.definitions
            .filter((document): boolean => document.kind === "EnumTypeDefinition")
            .map((document): EnumTypeDefinitionNode => (document as EnumTypeDefinitionNode));

        return enums.map((document: EnumTypeDefinitionNode): Enum => (
            {
                name: document.name ? document.name.value : "",
                values: this.getEnumValues(document.values),
                description: document.description ? document.description.value : "",
                directive: this.getDirectives(document.directives)
            }));
    }

    public getMutations(): Code[] {
        const mutations = this.documentNode.definitions
            .filter((document): boolean => document.kind === "OperationDefinition")
            .map((document): OperationDefinitionNode => (document as OperationDefinitionNode))
            .filter((document: OperationDefinitionNode): boolean => document.operation === "mutation");

        return mutations.map((document: OperationDefinitionNode): Code => (
            { name: document.name ? document.name.value : "", code: document.loc ? this.text.substring(document.loc.start, document.loc.end) : "" }));
    }

    public getQueries(): Code[] {
        const queries = this.documentNode.definitions
            .filter((document): boolean => document.kind === "OperationDefinition")
            .map((document): OperationDefinitionNode => (document as OperationDefinitionNode))
            .filter((document: OperationDefinitionNode): boolean => document.operation === "query");

        return queries.map((document: OperationDefinitionNode): Code => (
            { name: document.name ? document.name.value : "", code: document.loc ? this.text.substring(document.loc.start, document.loc.end) : "" }));
    }

    public getTypes(): Type[] {
        const types = this.documentNode.definitions
            .filter((document): boolean => document.kind === "ObjectTypeDefinition")
            .map((document): ObjectTypeDefinitionNode => (document as ObjectTypeDefinitionNode));

        return types.map((document: ObjectTypeDefinitionNode): Type => {
            const codeStart = document.description?.loc ? document.description.loc.end + 1 : document.loc.start;
            return {
                name: document.name ? document.name.value : "",
                directive: this.getDirectives(document.directives),
                interfaces: this.getNames(document.interfaces),
                fields: this.getFieldDetails(document.fields),
                description: document.description ? document.description.value : "",
                code: document.loc ? this.text.substring(codeStart, document.loc.end) : ""
            }
        });
    }

    private getDirectives(directives?: ReadonlyArray<DirectiveNode>): string {
        if (!directives || directives.length === 0) {
            return "";
        }
        return directives.map((directive) => directive.loc ? this.text.substring(directive.loc.start, directive.loc.end) : "").join(" ");
    }

    private getEnumValues(values?: readonly EnumValueDefinitionNode[]): string {
        if (!values) {
            return "";
        }
        const result: string[] = [];
        values.forEach((value): void => {
            const directive = this.getDirectives(value.directives);
            const directiveValue = directive !== "" ? ` ${directive}` : ``;
            result.push(`${value.name.value}${directiveValue}`)
        });
        return result.join("\n");
    }

    private getNames(names?: readonly NamedTypeNode[]): string[] {
        if (!names) {
            return [];
        }
        return names.map((name): string => name.name.value);
    }

    private isRequired(type: TypeNode): boolean {
        return type.kind === 'NonNullType';
    }

    private getDatatype(type: TypeNode): string {
        let currentType = type;
        while (currentType.kind === 'NonNullType' || currentType.kind === 'ListType') {
            currentType = currentType.type;
        }
        return currentType.name.value;
    }

    private isArray(type: TypeNode): boolean {
        return (type.kind === 'ListType') || (type.kind === 'NonNullType' && type.type.kind === 'ListType');
    }

    private getArgs(field: FieldDefinitionNode): string {
        const argumentsText = field.arguments ? field.arguments.map((arg) => arg.loc ? this.text.substring(arg.loc.start, arg.loc.end) : "").join(",") : "";
        if (argumentsText.length > 0) {
            return `(${argumentsText})`;
        }
        return "";
    }

    private getFieldDetails(fields?: readonly FieldDefinitionNode[]): Field[] {
        if (!fields) {
            return [];
        }
        return fields.map((field): Field => {
            return {
                name: field.name.value,
                required: this.isRequired(field.type),
                datatype: this.getDatatype(field.type),
                array: this.isArray(field.type),
                args: this.getArgs(field),
                directive: this.getDirectives(field.directives),
                description: field.description
                    ? field.description.value
                    : ""
            };
        });
    }

    public getInterfaces(): Interface[] {
        const interfaces = this.documentNode.definitions
            .filter((document): boolean => document.kind === "InterfaceTypeDefinition")
            .map((document): InterfaceTypeDefinitionNode => (document as InterfaceTypeDefinitionNode));

        return interfaces.map((document: InterfaceTypeDefinitionNode): Interface => {
            return {
                name: document.name ? document.name.value : "",
                interfaces: this.getNames(document.interfaces),
                fields: this.getFieldDetails(document.fields),
                description: document.description ? document.description.value : "",
                directive: this.getDirectives(document.directives)
            }
        });
    }

    public getInputs(): Input[] {
        const inputs = this.documentNode.definitions
            .filter((document): boolean => document.kind === "InputObjectTypeDefinition")
            .map((document): InterfaceTypeDefinitionNode => (document as InterfaceTypeDefinitionNode));

        return inputs.map((document: InterfaceTypeDefinitionNode): Input => {
            return {
                name: document.name ? document.name.value : "",
                fields: this.getFieldDetails(document.fields),
                description: document.description ? document.description.value : "",
                directive: this.getDirectives(document.directives)
            }
        });
    }

    public getUnions(): Union[] {
        const unions = this.documentNode.definitions
            .filter((document): boolean => document.kind === "UnionTypeDefinition")
            .map((document): UnionTypeDefinitionNode => (document as UnionTypeDefinitionNode));

        return unions.map((document: UnionTypeDefinitionNode): Union => ({
            name: document.name ? document.name.value : "",
            types: this.getNames(document.types),
            description: document.description ? document.description.value : "",
            directive: this.getDirectives(document.directives)
        }));
    }
}

export interface Code {
    name: string;
    code: string;
}

export interface Enum {
    name: string;
    description: string;
    directive: string;
    values: string;
}
export interface Scalar extends Code {
    directive: string;
}

export interface Type {
    name: string;
    directive: string;
    description: string;
    interfaces: string[];
    fields: Field[];
    code: string;
}

export interface Field {
    name: string;
    datatype: string;
    required: boolean;
    array: boolean;
    args: string;
    directive: string;
    description: string;
}

export interface Interface {
    name: string;
    description: string;
    directive: string;
    interfaces: string[];
    fields: Field[];
}

export interface Input {
    name: string;
    description: string;
    directive: string;
    fields: Field[];
}

export interface Union {
    name: string;
    description: string;
    directive: string;
    types: string[];
}

