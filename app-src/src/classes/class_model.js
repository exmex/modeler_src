import { v4 as uuidv4 } from "uuid";

export class ClassModel {
  constructor(id, diagramId, name, desc, type, version, storedIn) {
    this.name = name || "new project";
    this.id = id || uuidv4();
    this.activeDiagram = diagramId;
    this.desc = desc;
    this.path = "";
    this.type = type;
    this.version = version;
    this.parentTableInFkCols = true;
    this.caseConvention = "under"; // under or camel
    this.replaceSpace = "_";
    this.color = "transparent";
    this.sideSelections = true;
    this.isDirty = true;
    this.storedin = storedIn;
    this.embeddedInParentsIsDisplayed = true;
    this.schemaContainerIsDisplayed = false;
    this.cardinalityIsDisplayed = false;
    this.estimatedSizeIsDisplayed = false;
    this.writeFileParam = false;
    this.currentDisplayMode = "metadata";
  }
}
