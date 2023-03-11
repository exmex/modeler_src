export class ClassOtherObject {
  constructor(id, name, type) {
    this.id = id;
    this.visible = true;
    this.name = name;
    this.desc = "";
    this.type = type;
    this.code = "";
    this.lines = [];
    this.generate = true;
    this.generateCustomCode = true;
  }
}

export const OtherObjectTypes = {
  Other: "Other",
  View: "View",
  Trigger: "Trigger",
  Sequence: "Sequence",
  Procedure: "Procedure",
  Function: "Function",
  Query: "Query",
  Mutation: "Mutation",
  Enum: "Enum",
  Scalar: "Scalar",
  MaterializedView: "MaterializedView",
  Domain: "Domain",
  Rule: "Rule",
  Policy: "Policy",
  TypeOther: "TypeOther"
};
