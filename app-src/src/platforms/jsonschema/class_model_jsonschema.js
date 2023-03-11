import { ClassModel } from "../../classes/class_model";

export class ClassModelJsonSchema extends ClassModel {
  constructor(
    id,
    diagramId,
    name,
    desc,
    type,
    version,
    storedIn,
    defaultValues
  ) {
    super(id, diagramId, name, desc, type, version, storedIn);
    this.def_coltopk = defaultValues.def_coltopk || false;
    this.jsonCodeSettings = {
      strict: false,
      definitionKeyName: "bySchema",
      format: "json"
    };
    this.showDescriptions = true;
    this.showSpecifications = true;
    this.showLocallyReferenced = true;
  }
}
