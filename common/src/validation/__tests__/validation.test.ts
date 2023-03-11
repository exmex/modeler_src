import { Column, Index, Key, Line } from "../../structure";
import {
  XProperty,
  getInstancePathByXRefPath,
  getModelNode,
  getModelNodeProperty,
  getSchemaNode,
  getSubschema,
  isValid
} from "../validation";
import { describe, expect, it } from "@jest/globals";

import { schema } from "../../json_schema/modeler-schema";

describe("JSON Schema of a object", () => {
  describe("wrong path", () => {
    it("should return undefined schema on wrong path", () => {
      const result = getSubschema("/wrong");

      expect(result).toEqual(undefined);
    });

    it("should return undefined schema on wrong path", () => {
      const result = getSubschema("/tables/a");

      expect(result).toEqual(undefined);
    });

    it("should return undefined on wrong path", () => {
      const result = getSchemaNode("/tables/a");

      expect(result).toEqual(undefined);
    });
  });

  describe("tables", () => {
    it("should find JSON Schema for a table", () => {
      const result = getSubschema(
        "/tables/12a3742a-e711-4ccd-91f0-438257333f12"
      );

      expect(result).toEqual(
        schema.$defs.Tables.patternProperties[
          "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
        ]
      );
    });
  });

  describe("columns", () => {
    it("should find JSON Schema for a column", () => {
      const result = getSubschema(
        "/tables/12a3742a-e711-4ccd-91f0-438257333f12/cols/0"
      );

      expect(result).toEqual(schema.$defs.TableColumn);
    });
  });

  describe("indexes", () => {
    it("should find JSON Schema for index", () => {
      const result = getSubschema(
        "/tables/98bc68d1-4c70-45dc-9b58-0e1a00e3ad3c/indexes/0"
      );

      expect(result).toEqual(schema.$defs.TableIndex);
    });
  });

  describe("relation", () => {
    it("should find JSON Schema for a relation", () => {
      const result = getSubschema(
        "/relations/c08e5778-01cf-4208-abf5-55fb4728dbb3"
      );

      expect(result).toEqual(
        schema.$defs.Relations.patternProperties[
          "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
        ]
      );
    });
  });

  describe("view", () => {
    it("should find JSON Schema for a view", () => {
      const result = getSubschema(
        "/otherObjects/96241a13-bf0f-4033-be67-93e1af90e0b6"
      );

      expect(result).toEqual(
        schema.$defs.OtherObjects.patternProperties[
          "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
        ]
      );
    });
  });

  describe("trigger", () => {
    it("should find JSON Schema for a trigger", () => {
      const result = getSubschema(
        "/otherObjects/b964d326-d6d7-4e9a-96aa-44ced70f019f"
      );

      expect(result).toEqual(
        schema.$defs.OtherObjects.patternProperties[
          "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
        ]
      );
    });
  });
});

describe("Model nodes", () => {
  it("should find model node", () => {
    const result = getModelNode(sqliteWithAllObjects, "/");

    expect(result).toEqual(sqliteWithAllObjects);
  });

  it("should find table node", () => {
    const result = getModelNode(
      sqliteWithAllObjects,
      "/tables/12a3742a-e711-4ccd-91f0-438257333f12"
    );

    expect(result).toEqual(
      sqliteWithAllObjects.tables["12a3742a-e711-4ccd-91f0-438257333f12"]
    );
  });

  it("should find column node", () => {
    const result = getModelNode(
      sqliteWithAllObjects,
      "/tables/12a3742a-e711-4ccd-91f0-438257333f12/cols/1"
    );

    expect(result).toEqual(
      sqliteWithAllObjects.tables["12a3742a-e711-4ccd-91f0-438257333f12"]
        .cols[1]
    );
  });

  it("should find index node", () => {
    const result = getModelNode(
      sqliteWithAllObjects,
      "/tables/98bc68d1-4c70-45dc-9b58-0e1a00e3ad3c/keys/0"
    );

    expect(result).toEqual(
      sqliteWithAllObjects.tables["98bc68d1-4c70-45dc-9b58-0e1a00e3ad3c"]
        .keys[0]
    );
  });

  it("should find key node", () => {
    const result = getModelNode(
      sqliteWithAllObjects,
      "/tables/98bc68d1-4c70-45dc-9b58-0e1a00e3ad3c/keys/0"
    );

    expect(result).toEqual(
      sqliteWithAllObjects.tables["98bc68d1-4c70-45dc-9b58-0e1a00e3ad3c"]
        .keys[0]
    );
  });

  it("should find relation node", () => {
    const result = getModelNode(
      sqliteWithAllObjects,
      "/relations/c08e5778-01cf-4208-abf5-55fb4728dbb3"
    );

    expect(result).toEqual(
      sqliteWithAllObjects.relations["c08e5778-01cf-4208-abf5-55fb4728dbb3"]
    );
  });

  it("should find view node", () => {
    const result = getModelNode(
      sqliteWithAllObjects,
      "/otherObjects/96241a13-bf0f-4033-be67-93e1af90e0b6"
    );

    expect(result).toEqual(
      sqliteWithAllObjects.otherObjects["96241a13-bf0f-4033-be67-93e1af90e0b6"]
    );
  });

  it("should find trigger node", () => {
    const result = getModelNode(
      sqliteWithAllObjects,
      "/otherObjects/b964d326-d6d7-4e9a-96aa-44ced70f019f"
    );

    expect(result).toEqual(
      sqliteWithAllObjects.otherObjects["b964d326-d6d7-4e9a-96aa-44ced70f019f"]
    );
  });
});

describe("Schema x-properties", () => {
  it("should return x-name property of a table", () => {
    const result = getModelNodeProperty(
      sqliteWithAllObjects,
      "/tables/98bc68d1-4c70-45dc-9b58-0e1a00e3ad3c",
      XProperty.NAME,
      true
    );

    expect(result).toEqual("table2");
  });

  it("should return x-id of a table", () => {
    const result = getModelNodeProperty(
      sqliteWithAllObjects,
      "/tables/98bc68d1-4c70-45dc-9b58-0e1a00e3ad3c",
      XProperty.ID,
      true
    );

    expect(result).toEqual("98bc68d1-4c70-45dc-9b58-0e1a00e3ad3c");
  });

  it("should return x-name of a column", () => {
    const result = getModelNodeProperty(
      sqliteWithAllObjects,
      "/tables/98bc68d1-4c70-45dc-9b58-0e1a00e3ad3c/cols/1",
      XProperty.NAME,
      true
    );

    expect(result).toEqual("table1_id");
  });

  it("should return x-id of a column", () => {
    const result = getModelNodeProperty(
      sqliteWithAllObjects,
      "/tables/98bc68d1-4c70-45dc-9b58-0e1a00e3ad3c/cols/1",
      XProperty.ID,
      true
    );

    expect(result).toEqual("297f7cd1-6283-4e6b-9d9f-f688895998e7");
  });
});

describe("Reference translation into object path", () => {
  it("should return object path of name of object", () => {
    const result = getInstancePathByXRefPath(
      sqliteWithAllObjects,
      "/relations/c08e5778-01cf-4208-abf5-55fb4728dbb3/parent"
    );

    expect(result).toEqual("/tables/12a3742a-e711-4ccd-91f0-438257333f12");
  });

  it("should return object path of parent_key", () => {
    const result = getInstancePathByXRefPath(
      sqliteWithAllObjects,
      "/relations/c08e5778-01cf-4208-abf5-55fb4728dbb3/parent_key"
    );

    expect(result).toEqual(
      "/tables/12a3742a-e711-4ccd-91f0-438257333f12/keys/0"
    );
  });

  it("should return object path of colid of key", () => {
    const result = getInstancePathByXRefPath(
      sqliteWithAllObjects,
      "/tables/98bc68d1-4c70-45dc-9b58-0e1a00e3ad3c/keys/0/cols/0/colid"
    );

    expect(result).toEqual(
      "/tables/98bc68d1-4c70-45dc-9b58-0e1a00e3ad3c/cols/0"
    );
  });

  it("should return object path of colid of index", () => {
    const result = getInstancePathByXRefPath(
      sqliteWithAllObjects,
      "/tables/98bc68d1-4c70-45dc-9b58-0e1a00e3ad3c/indexes/0/cols/0/colid"
    );

    expect(result).toEqual(
      "/tables/98bc68d1-4c70-45dc-9b58-0e1a00e3ad3c/cols/0"
    );
  });

  it("should return object path of parent col of relation", () => {
    const result = getInstancePathByXRefPath(
      sqliteWithAllObjects,
      "/relations/c08e5778-01cf-4208-abf5-55fb4728dbb3/cols/0/parentcol"
    );

    expect(result).toEqual(
      "/tables/12a3742a-e711-4ccd-91f0-438257333f12/cols/0"
    );
  });

  it("should return object path of active diagram", () => {
    const result = getInstancePathByXRefPath(
      sqliteWithAllObjects,
      "/model/activeDiagram"
    );

    expect(result).toEqual("/diagrams/f620286f-45ff-4ca6-8691-05fa0e422724");
  });
});

describe("Valid", () => {
  it("should not validate incomplete store", async () => {
    await isValid(sqliteWithAllObjects);
  });

  it("should validate complete store", async () => {
    await isValid({
      ...sqliteWithAllObjects,
      selections: {},
      modelsSamples: {},
      notifications: {},
      profile: {}
    });
  });
});

const sqliteWithAllObjects = {
  tables: {
    "12a3742a-e711-4ccd-91f0-438257333f12": {
      id: "12a3742a-e711-4ccd-91f0-438257333f12",
      visible: true,
      name: "table1",
      desc: "",
      estimatedSize: "",
      cols: [
        {
          id: "f3accee6-b2f3-4389-bdac-c3671c6be035",
          name: "id",
          datatype: "INTEGER",
          pk: true,
          nn: true,
          comment: "",
          defaultvalue: "",
          data: "",
          after: "",
          sqlite: {
            autoincrement: false
          }
        } as Column
      ],
      relations: ["c08e5778-01cf-4208-abf5-55fb4728dbb3"],
      lines: ["6c647139-7077-49d6-893b-4d2cc531082a"],
      keys: [
        {
          id: "65490975-7bcc-4971-ae4a-29801d96fcb6",
          name: "Primary key",
          isPk: true,
          using: "na",
          cols: [
            {
              id: "6f4d3eba-4490-4023-8164-869b1a376dc4",
              colid: "f3accee6-b2f3-4389-bdac-c3671c6be035"
            }
          ]
        }
      ],
      indexes: [] as Index[],
      embeddable: false,
      generate: true,
      generateCustomCode: true,
      collation: "",
      objectType: "table",
      sqlite: {
        withoutrowid: false,
        strict: true
      }
    },
    "98bc68d1-4c70-45dc-9b58-0e1a00e3ad3c": {
      id: "98bc68d1-4c70-45dc-9b58-0e1a00e3ad3c",
      visible: true,
      name: "table2",
      desc: "table desc",
      estimatedSize: "estimated",
      cols: [
        {
          id: "05a92b7a-412f-43fe-a547-3c417f3ee650",
          name: "id",
          datatype: "INTEGER",
          pk: true,
          nn: true,
          comment: "col coment",
          defaultvalue: "default value",
          data: "sample data",
          collation: "colaltion",
          after: "after script",
          sqlite: {
            autoincrement: true
          },
          estimatedSize: "estimated size"
        } as Column,
        {
          id: "297f7cd1-6283-4e6b-9d9f-f688895998e7",
          name: "table1_id",
          datatype: "INTEGER",
          pk: false,
          nn: true,
          comment: "",
          defaultvalue: "",
          data: "",
          after: "",
          sqlite: {
            autoincrement: false
          },
          fk: true
        } as Column
      ],
      relations: ["c08e5778-01cf-4208-abf5-55fb4728dbb3"],
      lines: ["6c647139-7077-49d6-893b-4d2cc531082a"],
      keys: [
        {
          id: "af939509-ca59-48a1-831f-cbbd18f9ebbc",
          name: "Primary key",
          isPk: true,
          using: "na",
          cols: [
            {
              id: "db626f8d-fe2c-4ab0-8a37-e133d59296fe",
              colid: "05a92b7a-412f-43fe-a547-3c417f3ee650"
            }
          ]
        } as Key
      ],
      indexes: [
        {
          id: "0f039bde-c3cc-4afe-9b81-6fef48f291ed",
          name: "table2_ix_1",
          unique: true,
          fulltext: false,
          using: "na",
          algorithm: "",
          lockoption: "na",
          sqlite: {
            expression: "expression",
            desc: "description"
          },
          cols: [
            {
              id: "e266c8e7-b49c-4012-bb3d-978bc5069211",
              colid: "05a92b7a-412f-43fe-a547-3c417f3ee650"
            }
          ]
        }
      ],
      embeddable: false,
      generate: true,
      generateCustomCode: true,
      collation: "",
      objectType: "table",
      sqlite: {
        withoutrowid: true,
        strict: true
      }
    }
  },
  relations: {
    "c08e5778-01cf-4208-abf5-55fb4728dbb3": {
      id: "c08e5778-01cf-4208-abf5-55fb4728dbb3",
      visible: true,
      name: "table1_table2",
      desc: "",
      type: "identifying",
      parent_key: "65490975-7bcc-4971-ae4a-29801d96fcb6",
      parent: "12a3742a-e711-4ccd-91f0-438257333f12",
      child: "98bc68d1-4c70-45dc-9b58-0e1a00e3ad3c",
      c_mp: "true",
      c_mch: "true",
      c_p: "one",
      c_ch: "many",
      c_cp: "",
      c_cch: "",
      cols: [
        {
          id: "bf349bc1-9350-4bb4-9fb6-06a089184722",
          parentcol: "f3accee6-b2f3-4389-bdac-c3671c6be035",
          childcol: "297f7cd1-6283-4e6b-9d9f-f688895998e7"
        }
      ],
      generate: true,
      generateCustomCode: true
    }
  },
  notes: {},
  lines: {
    "6c647139-7077-49d6-893b-4d2cc531082a": {
      id: "6c647139-7077-49d6-893b-4d2cc531082a",
      visible: true,
      name: "table1-table2",
      desc: "",
      style: "solid",
      parent: "12a3742a-e711-4ccd-91f0-438257333f12",
      child: "98bc68d1-4c70-45dc-9b58-0e1a00e3ad3c",
      lineColor: "transparent",
      markerStart: "none",
      markerEnd: "arrowEnd",
      linegraphics: "basic",
      generate: true
    }
  },
  model: {
    name: "simple sqlite with all objects",
    id: "18157eb5-9325-4712-a364-e399faf58c1f",
    activeDiagram: "f620286f-45ff-4ca6-8691-05fa0e422724",
    desc: "",
    path: "",
    type: "SQLITE",
    version: 1,
    parentTableInFkCols: true,
    caseConvention: "under",
    replaceSpace: "_",
    color: "transparent",
    sideSelections: true,
    isDirty: true,
    storedin: {
      major: 5,
      minor: 1,
      extra: 0
    },
    embeddedInParentsIsDisplayed: true,
    schemaContainerIsDisplayed: false,
    cardinalityIsDisplayed: false,
    estimatedSizeIsDisplayed: false,
    writeFileParam: false,
    currentDisplayMode: "metadata",
    def_collation: "",
    def_coltopk: true,
    sqlSettings: {
      wrapLines: true,
      wrapOffset: 80,
      indent: true,
      indentationString: "spaces",
      indentationSize: 2,
      limitItemsOnLine: true,
      maxListItemsOnLine: 3,
      statementDelimiter: ";",
      routineDelimiter: ";",
      keywordCase: "upper",
      identiferCase: "original",
      includeSchema: "always",
      quotation: "if_needed"
    },
    lastSaved:
      "Thu Nov 03 2022 12:51:58 GMT+0100 (Central European Standard Time)"
  },
  otherObjects: {
    "96241a13-bf0f-4033-be67-93e1af90e0b6": {
      id: "96241a13-bf0f-4033-be67-93e1af90e0b6",
      visible: true,
      name: "view1",
      desc: "view desc",
      type: "View",
      code: "view code",
      lines: [] as string[],
      generate: true,
      generateCustomCode: true
    },
    "b964d326-d6d7-4e9a-96aa-44ced70f019f": {
      id: "b964d326-d6d7-4e9a-96aa-44ced70f019f",
      visible: true,
      name: "trigger1",
      desc: "trigger desc",
      type: "Trigger",
      code: "trigger code",
      lines: [] as string[],
      generate: true,
      generateCustomCode: true
    },
    "b0e023dd-fc9a-4aa7-8341-2fd5ff4dd9f2": {
      id: "b0e023dd-fc9a-4aa7-8341-2fd5ff4dd9f2",
      visible: true,
      name: "other1",
      desc: "other desc",
      type: "Other",
      code: "other code",
      lines: [] as string[],
      generate: true,
      generateCustomCode: true
    }
  },
  diagrams: {
    "f620286f-45ff-4ca6-8691-05fa0e422724": {
      name: "Main Diagram",
      description: "",
      id: "f620286f-45ff-4ca6-8691-05fa0e422724",
      keysgraphics: true,
      linegraphics: "detailed",
      zoom: 1,
      background: "transparent",
      lineColor: "transparent",
      isOpen: true,
      main: true,
      diagramItems: {
        "12a3742a-e711-4ccd-91f0-438257333f12": {
          referencedItemId: "12a3742a-e711-4ccd-91f0-438257333f12",
          x: 45,
          y: 213,
          gHeight: 45,
          gWidth: 156,
          color: "#ffffff",
          background: "#03a9f4",
          resized: false,
          autoExpand: true
        },
        "98bc68d1-4c70-45dc-9b58-0e1a00e3ad3c": {
          referencedItemId: "98bc68d1-4c70-45dc-9b58-0e1a00e3ad3c",
          x: 122,
          y: 458,
          gHeight: 63,
          gWidth: 197,
          color: "#ffffff",
          background: "#03a9f4",
          resized: false,
          autoExpand: true
        },
        "96241a13-bf0f-4033-be67-93e1af90e0b6": {
          referencedItemId: "96241a13-bf0f-4033-be67-93e1af90e0b6",
          x: 88,
          y: 592,
          gHeight: 44,
          gWidth: 150,
          color: "#eee",
          background: "#3f51b5",
          resized: false,
          autoExpand: true
        },
        "b964d326-d6d7-4e9a-96aa-44ced70f019f": {
          referencedItemId: "b964d326-d6d7-4e9a-96aa-44ced70f019f",
          x: 83,
          y: 689,
          gHeight: 44,
          gWidth: 150,
          color: "#eee",
          background: "#9c27b0",
          resized: false,
          autoExpand: true
        },
        "b0e023dd-fc9a-4aa7-8341-2fd5ff4dd9f2": {
          referencedItemId: "b0e023dd-fc9a-4aa7-8341-2fd5ff4dd9f2",
          x: 114,
          y: 777,
          gHeight: 44,
          gWidth: 150,
          color: "#eee",
          background: "#009688",
          resized: false,
          autoExpand: true
        }
      },
      scroll: {
        x: 0,
        y: 0
      },
      type: "erd"
    }
  },
  order: [
    "b0e023dd-fc9a-4aa7-8341-2fd5ff4dd9f2",
    "12a3742a-e711-4ccd-91f0-438257333f12",
    "98bc68d1-4c70-45dc-9b58-0e1a00e3ad3c",
    "c08e5778-01cf-4208-abf5-55fb4728dbb3",
    "96241a13-bf0f-4033-be67-93e1af90e0b6",
    "b964d326-d6d7-4e9a-96aa-44ced70f019f",
    "6c647139-7077-49d6-893b-4d2cc531082a"
  ],
  collapsedTreeItems: [] as string[]
};
