import { CommonColumnMetadata } from "re";
import { JSONField } from "./triage/JSONField";
import { JSONMetamodelProvider } from "./JSONMetamodelProvider";
import { v4 as uuidv4 } from "uuid";

export class JSONColumnMetamodelProvider {
    public transform(
        jsonMetamodelProvider: JSONMetamodelProvider,
        fields: Map<string, JSONField>,
    ): CommonColumnMetadata[] {
        const result: CommonColumnMetadata[] = [];
        fields.forEach((field: JSONField): void => {
            let datatype;
            if (field.subDocument) {
                const subDocument = jsonMetamodelProvider.transformDocumentToModel(
                    field.subDocument,
                );
                datatype = subDocument.id;
            } else {
                datatype = field.defaultDatatype();
            }
            const columnMetadata: CommonColumnMetadata = {
                id: uuidv4(),
                name: field.name,
                datatype: datatype,
                param: "",
                pk: false,
                nn: false,
                comment: "",
                defaultvalue: "",
                zerofill: false,
                unsigned: false,
                after: "",
                enumSet: "",
                json: false,
                list: false,
                collation: "",
                charset: "",
                autoinc: false,
            };
            columnMetadata.list = field.isList();
            result.push(columnMetadata);
        });
        return result;
    }
}
