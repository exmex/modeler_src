// do not modify the schema
// schema is generated from ../json_schema/modeler.dpm

export const schema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: [
    "tables",
    "relations",
    "otherObjects",
    "lines",
    "notes",
    "diagrams",
    "order",
    "model",
    "selections",
    "modelsSamples",
    "notifications",
    "profile"
  ],
  properties: {
    tables: {
      description: "List of tables",
      $ref: "#/$defs/Tables",
      "x-serializable-model": true,
      "x-caption": "Tables",
      "x-map-by-property": {
        property: "objectType",
        schemas: {
          undefined: {
            default: "table"
          },
          table: {
            caption: "Tables",
            "new-key": "tables"
          },
          composite: {
            caption: "Composite",
            "new-key": "composites"
          }
        }
      }
    },
    relations: {
      description: "List of relations",
      $ref: "#/$defs/Relations",
      "x-serializable-model": true,
      "x-caption": "Relationships"
    },
    otherObjects: {
      description: "List of other objects",
      $ref: "#/$defs/OtherObjects",
      "x-serializable-model": true,
      "x-caption": "OtherObjects",
      "x-map-by-property": {
        property: "type",
        schemas: {
          view: {
            caption: "Views",
            "new-key": "views"
          },
          materializedView: {
            caption: "Materialized Views",
            "new-key": "mviews"
          },
          trigger: {
            caption: "Triggers",
            "new-key": "triggers"
          },
          function: {
            caption: "Functions",
            "new-key": "functions"
          },
          procedure: {
            caption: "Procedures",
            "new-key": "procedures"
          },
          rule: {
            caption: "Rules",
            "new-key": "rules"
          },
          policy: {
            caption: "Policies",
            "new-key": "policies"
          },
          sequence: {
            caption: "Sequences",
            "new-key": "sequences"
          },
          enum: {
            caption: "Enums",
            "new-key": "enums"
          },
          domain: {
            caption: "Domains",
            "new-key": "domains"
          },
          typeOther: {
            caption: "Types",
            "new-key": "types"
          },
          userDefinedType: {
            caption: "Used Defined Type",
            "new-key": "userdefinedtypes"
          }
        }
      }
    },
    lines: {
      description: "List of lines",
      $ref: "#/$defs/Lines",
      "x-serializable-model": true,
      "x-hidden": ["diff_html_reports"],
      "x-caption": "Lines"
    },
    notes: {
      description: "List of notes",
      $ref: "#/$defs/Notes",
      "x-serializable-model": true,
      "x-hidden": ["diff_html_reports"],
      "x-caption": "Notes"
    },
    diagrams: {
      $ref: "#/$defs/Diagrams",
      "x-serializable-model": true,
      "x-hidden": ["diff_html_reports"],
      "x-caption": "Diagrams"
    },
    order: {
      $ref: "#/$defs/Order",
      "x-serializable-model": true,
      "x-hidden": ["diff_html_reports"],
      "x-caption": "Order"
    },
    collapsedTreeItems: {
      type: "array",
      "x-serializable-model": true,
      "x-hidden": ["diff_html_reports"]
    },
    model: {
      $ref: "#/$defs/Model",
      "x-serializable-model": true,
      "x-hidden": ["diff_html_reports"]
    },
    connections: {
      $ref: "#/$defs/Connections",
      "x-source-module": "runtime",
      "x-serializable-app-encrypted": true,
      "x-hidden": ["diff_html_reports"]
    },
    settings: {
      $ref: "#/$defs/Settings",
      "x-source-module": "runtime",
      "x-serializable-app": true,
      "x-hidden": ["diff_html_reports"]
    },
    warnings: {
      $ref: "#/$defs/Warnings",
      "x-source-module": "re",
      "x-hidden": ["diff_html_reports"]
    },
    originalModel: {
      "x-source-module": "re",
      "x-hidden": ["diff_html_reports"],
      $ref: "#"
    },
    layoutUpdateDiagrams: {
      $ref: "#/$defs/LayoutUpdateDiagrams",
      "x-source-module": "re",
      "x-hidden": ["diff_html_reports"]
    },
    reverseStats: {
      $ref: "#/$defs/ReverseStats",
      "x-source-module": "re",
      "x-hidden": ["diff_html_reports"]
    },
    activeConnection: {
      $ref: "#/$defs/ConnectionReference",
      "x-source-module": "runtime",
      "x-hidden": ["diff_html_reports"]
    },
    internalError: {
      type: "null",
      "x-source-module": "runtime",
      "x-hidden": ["diff_html_reports"]
    },
    ui: {
      $ref: "#/$defs/Ui",
      "x-source-module": "runtime",
      "x-hidden": ["diff_html_reports"]
    },
    selections: {
      $ref: "#/$defs/Selections",
      "x-source-module": "runtime",
      "x-hidden": ["diff_html_reports"]
    },
    modelsSamples: {
      $ref: "#/$defs/ModelsSamples",
      "x-source-module": "runtime",
      "x-hidden": ["diff_html_reports"]
    },
    notifications: {
      $ref: "#/$defs/Notifications",
      "x-source-module": "runtime",
      "x-hidden": ["diff_html_reports"]
    },
    profile: {
      $ref: "#/$defs/Profile",
      "x-source-module": "runtime",
      "x-hidden": ["diff_html_reports"]
    },
    objectsCopyList: {
      type: "object",
      "x-source-module": "runtime",
      "x-hidden": ["diff_html_reports"]
    },
    modelsList: {
      type: "object",
      "x-source-module": "runtime",
      "x-hidden": ["diff_html_reports"]
    },
    localization: {
      type: "object",
      "x-source-module": "runtime",
      "x-hidden": ["diff_html_reports"]
    },
    catalogColumns: {
      type: "object",
      "x-source-module": "runtime",
      "x-hidden": ["diff_html_reports"]
    },
    undoRedo: {
      type: "object",
      "x-source-module": "runtime",
      "x-hidden": ["diff_html_reports"]
    }
  },
  $defs: {
    Tables: {
      type: "object",
      patternProperties: {
        "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$": {
          type: "object",
          properties: {
            id: {
              $ref: "#/$defs/Id",
              "x-hidden": ["diff_html_reports"]
            },
            visible: {
              type: "boolean",
              "x-type": "visible",
              "x-hidden": ["diff_html_reports"]
            },
            name: {
              type: "string",
              "x-type": "name",
              "x-caption": "Name of object"
            },
            desc: {
              type: "string",
              "x-type": "desc",
              "x-caption": "Description"
            },
            schema: {
              description: "Version of schema",
              type: "string",
              "x-platforms": ["JSONSCHEMA", "OPENAPI"]
            },
            database: {
              type: "string",
              "x-platforms": ["MYSQL", "MARIADB"],
              "x-caption": "Schema"
            },
            rowformat: {
              type: "string",
              enum: [
                "na",
                "Default",
                "Compact",
                "Compressed",
                "Dynamic",
                "Fixed",
                "Redundant"
              ],
              "x-platforms": ["MYSQL", "MARIADB"],
              "x-caption": "Row format"
            },
            sqlite: {
              type: "object",
              properties: {
                withoutrowid: {
                  type: "boolean",
                  "x-caption": "Without ROWID"
                },
                strict: {
                  type: "boolean",
                  "x-caption": "Strict"
                }
              },
              "x-platforms": ["SQLITE"],
              "x-destruct": ["diff_html_reports"],
              required: ["withoutrowid"]
            },
            mssql: {
              type: "object",
              properties: {
                schema: {
                  type: "string",
                  "x-platforms": ["MSSQL"],
                  "x-caption": "Schema"
                }
              },
              "x-platforms": ["MSSQL"],
              "x-destruct": ["diff_html_reports"]
            },
            pg: {
              type: "object",
              properties: {
                tablespace: {
                  type: "string",
                  "x-platforms": ["PG"],
                  "x-caption": "Tablespace"
                },
                inherits: {
                  type: "string",
                  "x-platforms": ["PG"],
                  "x-caption": "Inherits"
                },
                storageParameters: {
                  type: "string",
                  "x-platforms": ["PG"],
                  "x-caption": "Storage parameters"
                },
                partition: {
                  type: "string",
                  "x-platforms": ["PG"],
                  "x-caption": "Partition"
                },
                rowsecurity: {
                  type: "boolean",
                  "x-platforms": ["PG"],
                  "x-caption": "Row security"
                },
                schema: {
                  type: "string",
                  "x-platforms": ["PG"],
                  "x-caption": "Schema"
                },
                partitionNames: {
                  type: "array",
                  items: {
                    type: "string"
                  },
                  "x-platforms": ["PG"],
                  "x-hidden": ["diff_html_reports"]
                }
              },
              "x-platforms": ["PG"],
              "x-destruct": ["diff_html_reports"],
              required: ["schema"]
            },
            collation: {
              type: "string",
              "x-platforms": ["MONGODB", "MYSQL", "MARIADB", "SEQUELIZE"],
              "x-caption": "Collation"
            },
            charset: {
              type: "string",
              "x-platforms": ["MYSQL", "MARIADB", "SEQUELIZE"],
              "x-caption": "Charset"
            },
            tabletype: {
              type: "string",
              "x-platforms": ["MYSQL", "MARIADB", "SEQUELIZE"],
              "x-caption": "Table type"
            },
            initautoinc: {
              type: "string",
              "x-platforms": ["MYSQL", "MARIADB", "SEQUELIZE"],
              "x-caption": "Autoincrement init"
            },
            beforeScript: {
              type: "string",
              "x-caption": "Before script"
            },
            afterScript: {
              type: "string",
              "x-caption": "After script"
            },
            cols: {
              description: "List of table columns",
              type: "array",
              items: {
                $ref: "#/$defs/TableColumn"
              },
              "x-type": "array-object",
              "x-caption": "Columns"
            },
            keys: {
              description: "List of table keys",
              type: "array",
              items: {
                $ref: "#/$defs/TableKey"
              },
              "x-type": "array-object",
              "x-caption": "Keys"
            },
            indexes: {
              description: "List of table indexes",
              type: "array",
              items: {
                $ref: "#/$defs/TableIndex"
              },
              "x-type": "array-object",
              "x-caption": "Indexes"
            },
            relations: {
              description: "List of table relationships",
              type: "array",
              items: {
                $ref: "#/$defs/RelationReference"
              },
              "x-caption": "Relationships",
              "x-item-caption": "Relationship"
            },
            lines: {
              description: "List of table lines",
              type: "array",
              items: {
                $ref: "#/$defs/ObjectReference"
              },
              "x-hidden": ["diff_html_reports"]
            },
            generate: {
              type: "boolean",
              "x-hidden": ["diff_html_reports"],
              "x-caption": "Generate"
            },
            generateCustomCode: {
              type: "boolean",
              "x-hidden": ["diff_html_reports"],
              "x-caption": "Generate custom code"
            },
            validationAction: {
              type: "string",
              "x-platforms": ["MONGODB"]
            },
            validationLevel: {
              type: "string",
              "x-platforms": ["MONGODB"]
            },
            size: {
              type: "number",
              "x-platforms": ["MONGODB"]
            },
            max: {
              type: "number",
              "x-platforms": ["MONGODB"]
            },
            capped: {
              type: "boolean",
              "x-platforms": ["MONGODB"]
            },
            others: {
              type: "string",
              "x-platforms": ["MONGODB"]
            },
            freezeTableName: {
              type: "boolean",
              "x-platforms": ["SEQUELIZE"]
            },
            paranoid: {
              type: "boolean",
              "x-platforms": ["SEQUELIZE"]
            },
            timestamps: {
              type: "boolean",
              "x-platforms": ["SEQUELIZE"]
            },
            version: {
              type: "boolean",
              "x-platforms": ["SEQUELIZE"]
            },
            underscored: {
              type: "boolean",
              "x-platforms": ["SEQUELIZE"]
            },
            embeddable: {
              type: "boolean",
              default: false,
              "x-hidden": ["diff_html_reports"]
            },
            estimatedSize: {
              type: "string",
              "x-platforms": [
                "MYSQL",
                "MARIADB",
                "SEQUELIZE",
                "PG",
                "LOGICAL",
                "SQLITE",
                "MONGODB",
                "MONGOOSE",
                "MSSQL"
              ]
            },
            directive: {
              type: "string",
              "x-platforms": ["GRAPHQL"]
            },
            validation: {
              type: "string",
              "x-platforms": ["MONGODB"]
            },
            objectType: {
              type: "string",
              enum: [
                "table",
                "composite",
                "interface",
                "union",
                "type",
                "input"
              ],
              "x-platforms": ["GRAPHQL", "PG"],
              "x-hidden": ["diff_html_reports"]
            },
            nodeType: {
              type: "string",
              enum: ["standard", "root", "subschema", "external_ref"],
              "x-platforms": ["JSONSCHEMA", "OPENAPI"]
            },
            specification: {
              type: "string",
              "x-platforms": ["JSONSCHEMA", "OPENAPI"]
            },
            refUrl: {
              type: "string",
              "x-platforms": ["JSONSCHEMA", "OPENAPI"]
            },
            json: {
              type: "boolean",
              "x-hidden": ["diff_html_reports"],
              "x-caption": "Internal"
            },
            background: {
              type: "string",
              "x-hidden": ["diff_html_reports"],
              "x-obsolete": true
            },
            singular: {
              type: "string",
              "x-platforms": ["SEQUELIZE"],
              "x-caption": "Singular name"
            },
            plural: {
              type: "string",
              "x-caption": "Plural name",
              "x-platforms": ["SEQUELIZE"]
            },
            tablename: {
              type: "string",
              "x-platforms": ["SEQUELIZE"],
              "x-caption": "Table name"
            }
          },
          "x-type": "key-id",
          "x-sql-generation": ["SQLITE", "MYSQL", "MARIADB", "PG", "MSSQL"],
          required: [
            "id",
            "visible",
            "name",
            "desc",
            "cols",
            "keys",
            "indexes",
            "relations",
            "lines",
            "generate",
            "generateCustomCode"
          ]
        }
      }
    },
    Relations: {
      type: "object",
      patternProperties: {
        "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$": {
          type: "object",
          properties: {
            id: {
              description: "Relation identification",
              $ref: "#/$defs/Id",
              "x-hidden": ["diff_html_reports"]
            },
            name: {
              description: "Relation name",
              type: "string",
              "x-type": "name",
              "x-caption": "Name"
            },
            desc: {
              description: "Description",
              type: "string",
              "x-type": "desc",
              "x-caption": "Description"
            },
            cols: {
              description: "Parent and child columns mapping",
              type: "array",
              items: {
                $ref: "#/$defs/RelationColumn",
                "x-caption": "Column"
              },
              "x-type": "array-object",
              "x-caption": "Columns"
            },
            generate: {
              type: "boolean",
              "x-hidden": ["diff_html_reports"],
              "x-caption": "Generate"
            },
            generateCustomCode: {
              type: "boolean",
              "x-hidden": ["diff_html_reports"],
              "x-caption": "Generate custom code"
            },
            type: {
              description: "Type of relation",
              type: "string",
              enum: ["identifying", "simple"],
              "x-hidden": ["diff_html_reports"]
            },
            parent: {
              description: "Parent table reference",
              $ref: "#/$defs/TableReference",
              "x-caption": "Parent"
            },
            child: {
              description: "Child table reference",
              $ref: "#/$defs/TableReference",
              "x-caption": "Child"
            },
            parent_key: {
              description: "Parent key reference",
              $ref: "#/$defs/TableKeyReference",
              "x-hidden": ["diff_html_reports"],
              "x-caption": "Parent key"
            },
            ri_pd: {
              type: "string",
              "x-caption": "RI delete"
            },
            ri_pu: {
              type: "string",
              "x-caption": "RI update"
            },
            c_mp: {
              description: "Parent ordinality (Optional, Mandatory)",
              type: "string",
              enum: ["false", "true"],
              "x-caption": "Mandatory parent"
            },
            c_mch: {
              description: "Child ordinality (Optional, Mandatory)",
              type: "string",
              enum: ["false", "true"],
              "x-caption": "Mandatory child"
            },
            c_p: {
              description: "Parent cardinality",
              type: "string",
              enum: ["one", "many", "zillion"],
              "x-caption": "Ordinality parent"
            },
            c_ch: {
              description: "Child cardinality",
              type: "string",
              enum: ["one", "many", "zillion"],
              "x-caption": "Ordinality child"
            },
            c_cp: {
              description: "Child caption",
              type: "string",
              "x-caption": "Parent caption"
            },
            c_cch: {
              description: "Child caption",
              type: "string",
              "x-caption": "Child caption"
            },
            visible: {
              type: "boolean",
              "x-hidden": ["diff_html_reports"],
              "x-caption": "Visible"
            },
            orm_association_belongs: {
              type: "string",
              "x-platforms": ["SEQUELIZE"],
              "x-caption": "Belongs to"
            },
            orm_through_belongs: {
              type: "string",
              "x-platforms": ["SEQUELIZE"],
              "x-caption": "Belongs to - through"
            },
            orm_alias_belongs: {
              type: "string",
              "x-platforms": ["SEQUELIZE"],
              "x-caption": "Belongs to - alias"
            },
            orm_constraints_belongs: {
              type: "boolean",
              "x-platforms": ["SEQUELIZE"],
              "x-caption": "Belongs to - skip constraints"
            },
            orm_association_has: {
              type: "string",
              "x-platforms": ["SEQUELIZE"],
              "x-caption": "Has"
            },
            orm_through_has: {
              type: "string",
              "x-platforms": ["SEQUELIZE"],
              "x-caption": "Has - through"
            },
            orm_alias_has: {
              type: "string",
              "x-platforms": ["SEQUELIZE"],
              "x-caption": "Has - alias"
            },
            orm_constraints_has: {
              type: "boolean",
              "x-platforms": ["SEQUELIZE"],
              "x-caption": "Has - skip constraints"
            }
          },
          "x-type": "key-id",
          "x-sql-generation": ["SQLITE", "MYSQL", "MARIADB", "PG", "MSSQL"],
          required: [
            "id",
            "name",
            "desc",
            "generate",
            "generateCustomCode",
            "type",
            "parent",
            "child",
            "parent_key",
            "c_mp",
            "c_mch",
            "c_p",
            "c_ch",
            "c_cp",
            "c_cch"
          ]
        }
      }
    },
    OtherObjects: {
      type: "object",
      patternProperties: {
        "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$": {
          type: "object",
          properties: {
            id: {
              $ref: "#/$defs/Id"
            },
            visible: {
              type: "boolean",
              "x-type": "visible",
              "x-hidden": ["diff_html_reports"]
            },
            name: {
              type: "string",
              "x-type": "name",
              "x-caption": "Name"
            },
            desc: {
              type: "string",
              "x-type": "desc",
              "x-caption": "Description"
            },
            lines: {
              type: "array",
              items: {
                $ref: "#/$defs/ObjectReference"
              },
              "x-hidden": ["diff_html_reports"]
            },
            code: {
              type: "string",
              "x-caption": "Script",
              "x-hidden": ["diff_html_reports"]
            },
            type: {
              type: "string",
              enum: [
                "Other",
                "View",
                "Trigger",
                "Sequence",
                "Procedure",
                "Function",
                "Query",
                "Mutation",
                "Enum",
                "Scalar",
                "MaterializedView",
                "Domain",
                "Rule",
                "Policy",
                "TypeOther"
              ],
              "x-caption": "Type of object"
            },
            enumValues: {
              type: "string",
              "x-caption": "Enum values"
            },
            directive: {
              type: "string",
              "x-caption": "Directive"
            },
            generate: {
              type: "boolean",
              "x-hidden": ["diff_html_reports"],
              "x-caption": "Generate"
            },
            generateCustomCode: {
              type: "boolean",
              "x-hidden": ["diff_html_reports"],
              "x-caption": "Generate custom code"
            },
            pg: {
              type: "object",
              properties: {
                schema: {
                  type: "string",
                  "x-caption": "Schema"
                },
                type: {
                  type: "string",
                  "x-caption": "Type"
                },
                domain: {
                  type: "object",
                  properties: {
                    not_null: {
                      type: "boolean",
                      "x-caption": "Not null"
                    },
                    constraints: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: {
                            $ref: "#/$defs/Id",
                            "x-hidden": ["diff_html_reports"]
                          },
                          name: {
                            type: "string",
                            "x-caption": "Name"
                          },
                          constraint_def: {
                            type: "string",
                            "x-caption": "Constraint definition"
                          }
                        },
                        "x-caption": "Items",
                        required: ["id", "name", "constraint_def"]
                      },
                      "x-caption": "Constraints"
                    },
                    collation: {
                      type: "string",
                      "x-caption": "Collation"
                    },
                    default: {
                      type: "string",
                      "x-caption": "Default"
                    },
                    datatype: {
                      type: "string",
                      "x-caption": "Data type"
                    },
                    datatype_param: {
                      type: "string",
                      "x-caption": "Datatype param"
                    }
                  },
                  "x-caption": "Domain"
                },
                rule: {
                  type: "object",
                  properties: {
                    tablename: {
                      type: "string",
                      "x-caption": "Table name"
                    }
                  },
                  "x-caption": "Rule"
                },
                policy: {
                  type: "object",
                  properties: {
                    tablename: {
                      type: "string",
                      "x-caption": "Table name"
                    },
                    permissive: {
                      type: "boolean",
                      "x-caption": "Permissive"
                    },
                    command: {
                      type: "string",
                      "x-caption": "Command"
                    },
                    role_names: {
                      type: "array",
                      items: {
                        type: "string"
                      },
                      "x-caption": "Role names"
                    },
                    using_expression: {
                      "x-caption": "Using"
                    },
                    check_expression: {
                      "x-caption": "Check"
                    }
                  },
                  "x-caption": "Policy"
                },
                trigger: {
                  type: "object",
                  properties: {
                    tablename: {
                      type: "string",
                      "x-caption": "Table name"
                    }
                  },
                  "x-caption": "Trigger"
                }
              },
              "x-platforms": ["PG"],
              "x-destruct": ["diff_html_reports"]
            },
            mssql: {
              type: "object",
              properties: {
                schema: {
                  type: "string",
                  "x-caption": "Schema"
                },
                trigger: {
                  type: "object",
                  properties: {
                    tablename: {
                      type: "string",
                      "x-caption": "Table name"
                    }
                  },
                  "x-caption": "Trigger"
                },
                sequence: {
                  type: "object",
                  properties: {
                    start: {
                      type: "number",
                      "x-caption": "Start with"
                    },
                    increment: {
                      type: "number",
                      "x-caption": "Increment by"
                    },
                    minValue: {
                      type: "number",
                      "x-caption": "Min"
                    },
                    maxValue: {
                      type: "number",
                      "x-caption": "Max"
                    },
                    isCycling: {
                      type: "boolean",
                      "x-caption": "Cycle"
                    },
                    cache: {
                      type: "number",
                      "x-caption": "Cache"
                    }
                  },
                  "x-caption": "Sequence",
                  required: [
                    "start",
                    "increment",
                    "minValue",
                    "maxValue",
                    "isCycling"
                  ]
                },
                udt: {
                  type: "object",
                  properties: {
                    baseType: {
                      type: "string",
                      "x-caption": "Base type"
                    },
                    params: {
                      type: "string",
                      "x-caption": "Params"
                    },
                    isNotNull: {
                      type: "boolean",
                      "x-caption": "Not null"
                    },
                    externalName: {
                      type: "string",
                      "x-caption": "External Name"
                    },
                    asTable: {
                      type: "string",
                      "x-caption": "As table"
                    }
                  },
                  "x-caption": "UDT",
                  required: ["isNotNull"]
                }
              },
              "x-platforms": ["MSSQL"],
              "x-destruct": ["diff_html_reports"]
            }
          },
          "x-type": "key-id",
          "x-sql-generation": ["SQLITE", "MYSQL", "MARIADB", "PG", "MSSQL"],
          required: [
            "id",
            "visible",
            "name",
            "desc",
            "lines",
            "code",
            "type",
            "generate",
            "generateCustomCode"
          ]
        }
      }
    },
    TableReference: {
      type: "string",
      "x-type": "id-ref",
      "x-ref-path": [["tables"]],
      description: "Identification of referenced table"
    },
    TableKeyReference: {
      type: "string",
      "x-type": "id-ref",
      "x-ref-path": [["tables", "*", "keys"]],
      description: "Identification of referenced key"
    },
    RelationColumn: {
      description: "Mapping of column from child table to parent table",
      properties: {
        id: {
          $ref: "#/$defs/Id",
          "x-hidden": ["diff_html_reports"]
        },
        childcol: {
          $ref: "#/$defs/TableColumnReference",
          "x-caption": "Child column"
        },
        parentcol: {
          $ref: "#/$defs/TableColumnReference",
          "x-caption": "Parent column"
        }
      }
    },
    TableColumnReference: {
      type: "string",
      "x-type": "id-ref",
      "x-ref-path": [["tables", "*", "cols"]],
      description: "Identification of referenced column"
    },
    Id: {
      type: "string",
      pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
      "x-type": "id",
      "x-hidden": ["diff_html_reports"],
      description: "Identification of object"
    },
    ObjectReference: {
      type: "string",
      pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
      "x-type": "id-ref",
      "x-ref-path": [["tables"], ["otherObjects"], ["notes"]]
    },
    Lines: {
      type: "object",
      patternProperties: {
        "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$": {
          type: "object",
          properties: {
            id: {
              $ref: "#/$defs/Id"
            },
            visible: {
              type: "boolean",
              "x-type": "visible"
            },
            name: {
              type: "string",
              "x-type": "name"
            },
            desc: {
              type: "string",
              "x-type": "desc"
            },
            style: {
              type: "string"
            },
            parent: {
              $ref: "#/$defs/Id"
            },
            child: {
              $ref: "#/$defs/Id"
            },
            lineColor: {
              type: "string",
              "x-type": "color"
            },
            markerStart: {
              type: "string"
            },
            markerEnd: {
              type: "string"
            },
            linegraphics: {
              type: "string"
            },
            generate: {
              type: "boolean"
            }
          },
          "x-type": "key-id",
          required: [
            "id",
            "visible",
            "name",
            "desc",
            "style",
            "parent",
            "child",
            "lineColor",
            "markerStart",
            "markerEnd",
            "linegraphics",
            "generate"
          ]
        }
      }
    },
    Notes: {
      type: "object",
      patternProperties: {
        "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$": {
          type: "object",
          properties: {
            id: {
              $ref: "#/$defs/Id"
            },
            visible: {
              type: "boolean",
              "x-type": "visible"
            },
            name: {
              type: "string",
              "x-type": "name"
            },
            desc: {
              type: "string",
              "x-type": "desc"
            },
            lines: {
              type: "array",
              items: {
                $ref: "#/$defs/Id"
              },
              "x-hidden": ["diff_html_reports"]
            }
          },
          "x-type": "key-id",
          required: ["id", "visible", "name", "desc", "lines"]
        }
      }
    },
    Diagrams: {
      type: "object",
      patternProperties: {
        "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$": {
          type: "object",
          properties: {
            id: {
              $ref: "#/$defs/Id"
            },
            name: {
              type: "string",
              "x-type": "name"
            },
            description: {
              type: "string",
              "x-type": "desc"
            },
            keysgraphics: {
              type: "boolean"
            },
            linegraphics: {
              type: "string",
              enum: ["basic", "detailed"]
            },
            background: {
              type: "string",
              "x-type": "color"
            },
            lineColor: {
              type: "string",
              "x-type": "color"
            },
            isOpen: {
              type: "boolean"
            },
            zoom: {
              type: "number"
            },
            main: {
              type: "boolean"
            },
            diagramItems: {
              type: "object",
              patternProperties: {
                "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$":
                  {
                    type: "object",
                    properties: {
                      referencedItemId: {
                        $ref: "#/$defs/Id"
                      },
                      x: {
                        type: "number"
                      },
                      y: {
                        type: "number"
                      },
                      gHeight: {
                        type: "number"
                      },
                      gWidth: {
                        type: "number"
                      },
                      color: {
                        type: "string",
                        "x-type": "color"
                      },
                      background: {
                        type: "string",
                        "x-type": "color"
                      },
                      resized: {
                        type: "boolean"
                      },
                      autoExpand: {
                        type: "boolean"
                      }
                    },
                    "x-type": "key-id",
                    required: [
                      "referencedItemId",
                      "x",
                      "y",
                      "gHeight",
                      "gWidth",
                      "color",
                      "background",
                      "resized",
                      "autoExpand"
                    ]
                  }
              }
            },
            scroll: {
              type: "object",
              properties: {
                x: {
                  type: "number"
                },
                y: {
                  type: "number"
                }
              },
              required: ["x", "y"]
            },
            type: {
              type: "string",
              enum: ["erd", "treediagram"]
            }
          },
          "x-type": "key-id",
          required: [
            "id",
            "name",
            "description",
            "keysgraphics",
            "linegraphics",
            "background",
            "lineColor",
            "isOpen",
            "zoom",
            "main",
            "diagramItems",
            "scroll"
          ]
        }
      }
    },
    Order: {
      type: "array",
      items: {
        $ref: "#/$defs/OrderObjectReference"
      }
    },
    Warnings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          message: {
            type: "string"
          }
        }
      }
    },
    LayoutUpdateDiagrams: {
      type: "object",
      patternProperties: {
        "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$": {
          type: "object",
          properties: {
            ids: {
              type: "array",
              items: {
                $ref: "#/$defs/DiagramItemReference"
              }
            },
            start: {
              type: "object",
              properties: {
                x: {
                  type: "number"
                },
                y: {
                  type: "number"
                }
              },
              required: ["x", "y"]
            }
          },
          "x-type": "id-ref",
          "x-ref-path": [["diagrams"]],
          required: ["ids", "start"]
        }
      }
    },
    DiagramItemReference: {
      type: "string",
      pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
      "x-type": "id-ref",
      "x-ref-path": [["diagrams", "*", "diagramItems"]]
    },
    TableColumn: {
      type: "object",
      required: [
        "id",
        "name",
        "comment",
        "datatype",
        "param",
        "pk",
        "nn",
        "estimatedSize",
        "binary"
      ],
      properties: {
        id: {
          $ref: "#/$defs/Id",
          "x-hidden": ["diff_html_reports"]
        },
        name: {
          type: "string",
          "x-type": "name",
          "x-caption": "Name",
          "x-hidden": ["diff_html_reports"]
        },
        comment: {
          type: "string",
          "x-type": "desc",
          "x-caption": "Description"
        },
        datatype: {
          $ref: "#/$defs/ObjectReference",
          "x-type": "datatype",
          "x-caption": "Data type"
        },
        param: {
          type: "string",
          "x-caption": "Param"
        },
        pk: {
          type: "boolean",
          "x-caption": "Primary key"
        },
        nn: {
          type: "boolean",
          "x-caption": "Not null"
        },
        after: {
          type: "string",
          "x-platforms": ["PG", "SQLITE", "MARIADB", "MYSQL", "MSSQL"],
          "x-caption": "After script"
        },
        autoinc: {
          type: "boolean",
          "x-platforms": ["SEQUELIZE", "MARIADB", "MYSQL"],
          "x-caption": "Autoincrement"
        },
        collation: {
          "x-platforms": ["MONGODB", "SEQUELIZE", "MARIADB", "MYSQL", "PG"],
          type: ["string", "null"],
          "x-caption": "Collation"
        },
        charset: {
          type: ["string", "null"],
          "x-platforms": ["SEQUELIZE", "MARIADB", "MYSQL"],
          "x-caption": "Charset"
        },
        defaultvalue: {
          type: "string",
          "x-platforms": [
            "LOGICAL",
            "PG",
            "SQLITE",
            "SEQUELIZE",
            "MARIADB",
            "MYSQL",
            "MSSQL"
          ],
          "x-caption": "Default value"
        },
        enum: {
          type: "string",
          "x-platforms": ["MYSQL", "MARIADB", "MONGODB"],
          "x-caption": "Enumeration"
        },
        fk: {
          type: "boolean",
          "x-caption": "Foreign key"
        },
        list: {
          type: "boolean",
          "x-platforms": [
            "MYSQL",
            "MARIADB",
            "MONGODB",
            "MONGOOSE",
            "PG",
            "LOGICAL",
            "GRAPHQL",
            "MSSQL"
          ],
          "x-caption": "Array"
        },
        ref: {
          type: "string",
          "x-platforms": ["MONGOOSE"],
          "x-caption": "Ref"
        },
        unsigned: {
          type: "boolean",
          "x-platforms": ["MYSQL", "MARIADB", "MONGOOSE", "SEQUELIZE"],
          "x-caption": "Unsigned"
        },
        zerofill: {
          type: "boolean",
          "x-platforms": ["MYSQL", "MARIADB", "MONGOOSE", "SEQUELIZE"],
          "x-caption": "Zerofill"
        },
        data: {
          type: "string",
          "x-platforms": [
            "MYSQL",
            "MARIADB",
            "PG",
            "SQLITE",
            "MONGOOSE",
            "MONGODB",
            "MSSQL",
            "SEQUELIZE"
          ],
          "x-caption": "Sample data"
        },
        isHidden: {
          description: "Internal use",
          type: "boolean",
          "x-platforms": ["MONGOOSE"],
          "x-hidden": ["diff_html_reports"]
        },
        isArrayItemNn: {
          type: "boolean",
          "x-platforms": ["GRAPHQL"],
          "x-caption": "Is array item not null"
        },
        validation: {
          type: "string",
          "x-platforms": ["MONGODB", "SEQUELIZE"],
          "x-caption": "Validation"
        },
        pattern: {
          type: "boolean",
          "x-platforms": ["MONGODB"],
          "x-caption": "Is pattern"
        },
        any: {
          type: "string",
          "x-platforms": ["MONGOOSE"]
        },
        specification: {
          type: "string",
          "x-platforms": ["JSONSCHEMA"],
          "x-caption": "Specification"
        },
        useSchemaId: {
          type: "boolean",
          "x-platforms": ["JSONSCHEMA"],
          "x-caption": "Use schema ID"
        },
        fieldArguments: {
          type: "string",
          "x-platforms": ["GRAPHQL"],
          "x-caption": "Arguments"
        },
        fieldDirective: {
          type: "string",
          "x-platforms": ["GRAPHQL"],
          "x-caption": "Directive"
        },
        pg: {
          type: "object",
          properties: {
            generatedIdentity: {
              type: "string",
              "x-caption": "Generated identity"
            },
            generated: {
              type: "string",
              "x-caption": "Generated"
            },
            dimensions: {
              type: "number",
              "x-caption": "Dimensions"
            }
          },
          "x-platforms": ["PG"],
          "x-destruct": ["diff_html_reports"]
        },
        sqlite: {
          type: "object",
          properties: {
            autoincrement: {
              description: "The autoincrement field",
              type: "boolean",
              "x-caption": "Auto-increment"
            }
          },
          "x-platforms": ["SQLITE"],
          "x-destruct": ["diff_html_reports"],
          required: ["autoincrement"]
        },
        mssql: {
          type: "object",
          properties: {
            computed: {
              type: "string",
              "x-caption": "Computed"
            }
          },
          "x-platforms": ["MSSQL"],
          "x-destruct": ["diff_html_reports"],
          required: ["computed"]
        },
        nodeType: {
          type: "string",
          "x-caption": "Node type",
          "x-hidden": ["diff_html_reports"]
        },
        estimatedSize: {
          type: "string",
          "x-caption": "Estimated size",
          "x-hidden": ["diff_html_reports"]
        },
        json: {
          type: "boolean",
          default: false,
          "x-hidden": ["diff_html_reports"]
        },
        options: {
          type: "string",
          "x-caption": "Options",
          "x-platforms": ["MONGOOSE"]
        },
        enumrange: {
          type: "string",
          "x-platforms": ["SEQUELIZE"],
          "x-caption": "Enum or range"
        },
        binary: {
          type: "boolean",
          "x-platforms": ["MYSQL", "MARIADB"],
          "x-caption": "Binary"
        },
        unique: {
          type: "boolean",
          "x-platforms": ["SEQUELIZE"],
          "x-caption": "Unique"
        },
        uniqueName: {
          type: "string",
          "x-platforms": ["SEQUELIZE"],
          "x-caption": "Unique name"
        }
      }
    },
    TableKey: {
      type: "object",
      "x-no-object-if-empty": ["cols"],
      required: ["id", "isPk", "name", "cols"],
      properties: {
        id: {
          $ref: "#/$defs/Id",
          "x-hidden": ["diff_html_reports"]
        },
        isPk: {
          type: "boolean",
          "x-caption": "Primary key"
        },
        name: {
          type: "string",
          "x-type": "name",
          "x-caption": "Name"
        },
        cols: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: {
                $ref: "#/$defs/Id",
                "x-hidden": ["diff_html_reports"]
              },
              colid: {
                $ref: "#/$defs/TableColumnReference",
                "x-caption": "Column"
              }
            },
            required: ["id", "colid"]
          },
          "x-type": "array-object",
          "x-caption": "Columns"
        },
        mssql: {
          type: "object",
          properties: {
            clustered: {
              type: "boolean",
              "x-platforms": ["MSSQL"],
              "x-caption": "Clustered"
            }
          },
          "x-platforms": ["MSSQL"],
          "x-destruct": ["diff_html_reports"]
        }
      }
    },
    TableIndex: {
      type: "object",
      "x-sql-generation": ["SQLITE", "MYSQL", "MARIADB", "PG", "MSSQL"],
      required: ["id", "cols"],
      properties: {
        id: {
          $ref: "#/$defs/Id",
          "x-hidden": ["diff_html_reports"]
        },
        cols: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: {
                $ref: "#/$defs/Id",
                "x-caption": "ID"
              },
              colid: {
                $ref: "#/$defs/TableColumnReference",
                "x-caption": "Column"
              },
              pg: {
                type: "object",
                properties: {
                  desc: {
                    type: "boolean",
                    "x-caption": "Descending"
                  },
                  nullsLast: {
                    type: "boolean",
                    "x-caption": "Nulls last"
                  },
                  collate: {
                    type: "string",
                    "x-caption": "Collate"
                  },
                  expression: {
                    type: "string",
                    "x-caption": "Expression"
                  }
                },
                required: ["desc", "nullsLast", "collate", "expression"]
              },
              sqlite: {
                type: "object",
                properties: {
                  desc: {
                    type: "boolean",
                    "x-caption": "Description"
                  },
                  collate: {
                    type: "string",
                    "x-caption": "Collate"
                  },
                  expression: {
                    type: "string",
                    "x-caption": "Expression"
                  }
                },
                required: ["desc", "collate", "expression"]
              },
              mssql: {
                type: "object",
                properties: {
                  desc: {
                    type: "boolean",
                    "x-caption": "Descending"
                  }
                },
                required: ["desc"]
              }
            },
            required: ["id", "colid"]
          },
          "x-type": "array-object",
          "x-caption": "Columns in index"
        },
        name: {
          "x-type": "name",
          "x-caption": "Index name"
        },
        fulltext: {
          type: "boolean",
          "x-platforms": ["MARIADB", "MYSQL"],
          "x-caption": "Fulltext"
        },
        unique: {
          type: "boolean",
          "x-platforms": ["MARIADB", "MYSQL", "SQLITE", "PG", "MSSQL"],
          "x-caption": "Unique"
        },
        algorithm: {
          type: "string",
          "x-platforms": ["PG", "MARIADB", "MYSQL"],
          "x-caption": "Algorithm"
        },
        lockoption: {
          type: "string",
          "x-platforms": ["MARIADB", "MYSQL"],
          "x-caption": "Lock option"
        },
        pg: {
          type: "object",
          properties: {
            tablespace: {
              type: "string",
              "x-platforms": ["PG"],
              "x-caption": "Tablespace"
            },
            desc: {
              type: "string",
              "x-type": "desc",
              "x-platforms": ["PG"],
              "x-caption": "Description"
            },
            storageParameters: {
              type: "string",
              "x-platforms": ["PG"],
              "x-caption": "Storage parameters"
            },
            expression: {
              type: "string",
              "x-platforms": ["PG"],
              "x-caption": "Expression"
            }
          },
          "x-platforms": ["PG"],
          "x-destruct": ["diff_html_reports"]
        },
        sqlite: {
          type: "object",
          properties: {
            expression: {
              type: "string",
              "x-platforms": ["SQLITE"],
              "x-caption": "Expression"
            },
            desc: {
              type: "string",
              "x-caption": "Comment"
            }
          },
          "x-platforms": ["SQLITE"],
          "x-destruct": ["diff_html_reports"],
          required: ["desc"]
        },
        mongodb: {
          type: "object",
          properties: {
            options: {
              "x-platforms": ["MONGODB"],
              "x-caption": "Options"
            },
            fields: {
              "x-platforms": ["MONGODB"],
              "x-caption": "Fields"
            }
          },
          "x-platforms": ["MONGODB"]
        },
        using: {
          type: "string",
          "x-platforms": ["MARIADB", "MYSQL"],
          "x-caption": "Using"
        },
        mssql: {
          type: "object",
          properties: {
            type: {
              type: "string",
              "x-platforms": ["MSSQL"],
              "x-caption": "Type"
            },
            clustered: {
              type: "boolean",
              "x-platforms": ["MSSQL"],
              "x-caption": "Clustered"
            },
            primaryxml: {
              type: "boolean",
              "x-platforms": ["MSSQL"],
              "x-caption": "Primary XML"
            },
            where: {
              type: "string",
              "x-platforms": ["MSSQL"],
              "x-caption": "Where"
            },
            order: {
              type: "string",
              "x-platforms": ["MSSQL"],
              "x-hidden": ["diff_html_reports"],
              "x-caption": "Order"
            },
            with: {
              type: "string",
              "x-platforms": ["MSSQL"],
              "x-caption": "With"
            },
            using: {
              type: "string",
              "x-platforms": ["MSSQL"],
              "x-caption": "Using"
            },
            keyIndex: {
              type: "string",
              "x-platforms": ["MSSQL"],
              "x-caption": "Key index"
            },
            pathXMLIndex: {
              type: "string",
              "x-platforms": ["MSSQL"],
              "x-caption": "Path XML index"
            },
            onFilegroup: {
              type: "string",
              "x-platforms": ["MSSQL"],
              "x-caption": "Filegroup"
            },
            desc: {
              type: "string",
              "x-platforms": ["MSSQL"],
              "x-caption": "Description"
            }
          },
          "x-platforms": ["MSSQL"],
          "x-destruct": ["diff_html_reports"]
        }
      }
    },
    ReverseStats: {
      type: "object",
      properties: {
        reversedOn: {
          type: "number"
        },
        connectionId: {
          $ref: "#/$defs/ConnectionReference"
        },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              caption: {
                type: "string"
              },
              counter: {
                type: "object",
                properties: {
                  total: {
                    type: "number"
                  },
                  added: {
                    $ref: "#/$defs/ReverseStatItemCounterDetail"
                  },
                  removed: {
                    $ref: "#/$defs/ReverseStatItemCounterDetail"
                  },
                  modified: {
                    $ref: "#/$defs/ReverseStatItemCounterDetail"
                  }
                },
                required: ["total"]
              }
            },
            required: ["caption"]
          }
        }
      }
    },
    ReverseStatItemCounterDetail: {
      type: "object",
      required: ["count", "idNames"],
      properties: {
        count: {
          type: "number"
        },
        idNames: {
          type: "object",
          properties: {
            id: {
              $ref: "#/$defs/AnyObjectReference"
            },
            name: {
              type: "string"
            },
            containerId: {
              $ref: "#/$defs/TableReference"
            }
          },
          required: ["id", "name"]
        }
      }
    },
    Ui: {
      type: "object",
      properties: {
        tableModalIsDisplayed: {
          type: "boolean"
        },
        otherObjectModalIsDisplayed: {
          type: "boolean"
        },
        noteModalIsDisplayed: {
          type: "boolean"
        },
        relationModalIsDisplayed: {
          type: "boolean"
        },
        indexAssistantModalIsDisplayed: {
          type: "boolean"
        },
        newModelModalIsDisplayed: {
          type: "boolean"
        },
        reportModalIsDisplayed: {
          type: "boolean"
        },
        reverseStatsIsDisplayed: {
          type: "boolean"
        },
        openFromUrlModalIsDisplayed: {
          type: "boolean"
        },
        importFromUrlModalIsDisplayed: {
          type: "boolean"
        },
        modelModalIsDisplayed: {
          type: "boolean"
        },
        tipsModalIsDisplayed: {
          type: "boolean"
        },
        newConnectionModalIsDisplayed: {
          type: "boolean"
        },
        connectionModalIsDisplayed: {
          type: "boolean"
        },
        sqlModalIsDisplayed: {
          type: "boolean"
        },
        feedbackModalIsDisplayed: {
          type: "boolean"
        },
        proxyModalIsDisplayed: {
          type: "boolean"
        },
        lineModalIsDisplayed: {
          type: "boolean"
        },
        unsavedChangesModalIsDisplayed: {
          type: "boolean"
        },
        restoreModelModalIsDisplayed: {
          type: "boolean"
        },
        currentDiagramAreaMode: {
          type: "string",
          enum: [
            "addTable",
            "addComposite",
            "addDocument",
            "addInterface",
            "addUnion",
            "addInput",
            "addRelation",
            "addRelationBelongs",
            "addImplements",
            "addLine",
            "arrow",
            "addNote",
            "addTextNote",
            "addEnum",
            "addScalar",
            "addMutation",
            "addQuery",
            "addOther",
            "addView",
            "addFunction",
            "addProcedure",
            "addTrigger",
            "addMaterializedView",
            "addDomain",
            "addTypeOther",
            "addRule",
            "addPolicy",
            "addSequence",
            "addChoice",
            "addCondition",
            "addJsonExternalRef",
            "addJsonSchema",
            "addJsonObject",
            "addJsonArray"
          ]
        },
        forcedRenderer: {
          type: "object",
          properties: {
            id: {
              type: "number"
            },
            options: {
              type: "object",
              properties: {
                modelToDom: {
                  type: "boolean"
                },
                domToModel: {
                  type: "boolean"
                }
              }
            }
          },
          required: ["id", "options"]
        },
        asideRightIsDisplayed: {
          type: "boolean"
        },
        asideLeftIsDisplayed: {
          type: "boolean"
        },
        searchTerm: {
          type: "string"
        },
        diagramLoading: {
          type: "boolean"
        },
        zoom: {
          type: "number"
        },
        uiZoom: {
          type: "number"
        },
        buyProModalIsDisplayed: {
          type: "boolean"
        },
        confirmDeleteIsDisplayed: {
          type: "boolean"
        },
        confirmDeleteRelationIsDisplayed: {
          type: "boolean"
        },
        confirmDeleteLineIsDisplayed: {
          type: "boolean"
        },
        asideLeftWidth: {
          type: "number"
        },
        asideRightWidth: {
          type: "number"
        },
        panelsExpanded: {
          type: "object",
          properties: {
            pModel: {
              type: "boolean"
            },
            pDiagram: {
              type: "boolean"
            },
            pModelExtended: {
              type: "boolean"
            },
            pModelGraphics: {
              type: "boolean"
            },
            pTables: {
              type: "boolean"
            },
            pRelations: {
              type: "boolean"
            },
            pImplements: {
              type: "boolean"
            },
            pTypes: {
              type: "boolean"
            },
            pOtherObjectDetail: {
              type: "boolean"
            },
            pOtherObjectCode: {
              type: "boolean"
            },
            pViews: {
              type: "boolean"
            },
            pNotes: {
              type: "boolean"
            },
            PLines: {
              type: "boolean"
            },
            pTableDetail: {
              type: "boolean"
            },
            pTableExtended: {
              type: "boolean"
            },
            pTableKeys: {
              type: "boolean"
            },
            pTableIndexes: {
              type: "boolean"
            },
            pTableColumns: {
              type: "boolean"
            },
            pTableRelations: {
              type: "boolean"
            },
            pTableColors: {
              type: "boolean"
            },
            pTableSqlCreate: {
              type: "boolean"
            },
            pTableSqlSelect: {
              type: "boolean"
            },
            pTableSQLSelect: {
              type: "boolean"
            },
            pRelationDetail: {
              type: "boolean"
            },
            pRelationRi: {
              type: "boolean"
            },
            pRelationReferenced: {
              type: "boolean"
            },
            pRelationKey: {
              type: "boolean"
            },
            pRelationCardinality: {
              type: "boolean"
            },
            pRelationSqlCreate: {
              type: "boolean"
            },
            pDomainConstraints: {
              type: "boolean"
            },
            pRelationAssociation: {
              type: "boolean"
            },
            pModelBeforeAfter: {
              type: "boolean"
            },
            pTableCustomCode: {
              type: "boolean"
            },
            pLineCustomCode: {
              type: "boolean"
            },
            pRelationCustomCode: {
              type: "boolean"
            },
            pOtherObjectCustomCode: {
              type: "boolean"
            }
          }
        },
        relationClicks: {
          type: "number"
        },
        trialModalIsDisplayed: {
          type: "boolean"
        },
        eulaModalIsDisplayed: {
          type: "boolean"
        },
        colHeight: {
          type: "number"
        },
        callbackFn: {},
        confirmDeleteConnectionIsDisplayed: {
          type: "boolean"
        },
        confirmDeleteDiagramIsDisplayed: {
          type: "boolean"
        },
        diagramModalIsDisplayed: {
          type: "boolean"
        },
        diagramItemsModalIsDisplayed: {
          type: "boolean"
        },
        orderItemsModalIsDisplayed: {
          type: "boolean"
        },
        addDiagramsByContainersModalIsDisplayed: {
          type: "boolean"
        },
        changeScroll: {
          type: "object",
          properties: {
            x: {
              type: "number"
            },
            y: {
              type: "number"
            }
          }
        },
        reportIsRendered: {
          type: "boolean"
        },
        copiedFormat: {
          type: "object"
        },
        browserSettings: {
          type: "object"
        },
        browserDisclosure: {
          type: "object"
        },
        columnModalIsDisplayed: {
          type: "boolean"
        },
        specificationAssistantModalIsDisplayed: {
          type: "boolean"
        },
        textEditorModalIsDisplayed: {
          type: "boolean"
        },
        activeTask: {
          type: "null"
        }
      }
    },
    Model: {
      type: "object",
      required: [
        "id",
        "name",
        "desc",
        "activeDiagram",
        "path",
        "type",
        "version",
        "parentTableInFkCols",
        "caseConvention",
        "replaceSpace",
        "color",
        "sideSelections",
        "isDirty",
        "embeddedInParentsIsDisplayed",
        "schemaContainerIsDisplayed",
        "cardinalityIsDisplayed",
        "estimatedSizeIsDisplayed",
        "writeFileParam",
        "currentDisplayMode",
        "def_coltopk"
      ],
      properties: {
        id: {
          $ref: "#/$defs/Id"
        },
        name: {
          type: "string",
          "x-type": "name"
        },
        desc: {
          type: "string",
          "x-type": "desc"
        },
        activeDiagram: {
          $ref: "#/$defs/DiagramReference"
        },
        path: {
          type: "string"
        },
        type: {
          type: "string",
          enum: [
            "GRAPHQL",
            "JSON",
            "MARIADB",
            "MONGODB",
            "MONGOOSE",
            "MYSQL",
            "PG",
            "SEQUELIZE",
            "SQLITE",
            "LOGICAL",
            "JSONSCHEMA",
            "OPENAPI",
            "FULLJSON",
            "MSSQL"
          ]
        },
        version: {
          type: "number"
        },
        parentTableInFkCols: {
          type: "boolean",
          default: true
        },
        caseConvention: {
          type: "string",
          enum: ["na", "under", "camel"],
          default: "under"
        },
        replaceSpace: {
          type: "string",
          default: "_"
        },
        color: {
          type: "string",
          default: "transparent",
          "x-type": "color"
        },
        sideSelections: {
          type: "boolean",
          default: true
        },
        isDirty: {
          type: "boolean",
          default: true
        },
        storedin: {
          type: "object",
          properties: {
            major: {
              type: "number"
            },
            minor: {
              type: "number"
            },
            extra: {
              type: "number"
            }
          },
          required: ["major", "minor", "extra"]
        },
        embeddedInParentsIsDisplayed: {
          type: "boolean",
          default: true
        },
        schemaContainerIsDisplayed: {
          type: "boolean",
          default: false
        },
        cardinalityIsDisplayed: {
          type: "boolean",
          default: false
        },
        estimatedSizeIsDisplayed: {
          type: "boolean",
          default: false
        },
        writeFileParam: {
          type: "boolean",
          default: false
        },
        currentDisplayMode: {
          type: "string",
          enum: ["metadata", "indexes", "description", "data"],
          default: "metadata"
        },
        def_coltopk: {
          description: "Add new ID column to PK",
          type: "boolean"
        },
        jsonCodeSettings: {
          type: "object",
          properties: {
            strict: {
              description: "Generate strict JSON",
              type: "boolean",
              default: false
            },
            definitionKeyName: {
              description: "Definitions key",
              type: "string",
              enum: ["definitions", "$defs"]
            },
            format: {
              description: "Format",
              type: "string",
              enum: ["json", "yaml"]
            }
          },
          "x-platforms": ["JSONSCHEMA", "OPENAPI"],
          required: ["strict", "definitionKeyName", "format"]
        },
        showDescriptions: {
          type: "boolean",
          default: true,
          "x-platforms": ["JSONSCHEMA", "OPENAPI"]
        },
        showSpecifications: {
          type: "boolean",
          default: true,
          "x-platforms": ["JSONSCHEMA", "OPENAPI"]
        },
        showLocallyReferenced: {
          type: "boolean",
          default: true
        },
        lastSaved: {
          type: "string"
        },
        modelPdfReportPath: {
          type: "string"
        },
        modelHTMLReportDir: {
          type: "string"
        },
        filePath: {
          type: "string"
        },
        pg: {
          type: "object",
          properties: {
            schema: {
              type: "string",
              "x-platforms": ["PG"]
            }
          },
          "x-platforms": ["PG"],
          "x-destruct": ["diff_html_reports"]
        },
        sqlSettings: {
          type: "object",
          properties: {
            wrapLines: {
              type: "boolean",
              default: true
            },
            wrapOffset: {
              type: "number",
              default: 80
            },
            indent: {
              type: "boolean",
              default: true
            },
            indentationString: {
              type: "string",
              enum: ["spaces", "tabs"],
              default: "spaces"
            },
            indentationSize: {
              type: "number",
              default: 2
            },
            limitItemsOnLine: {
              type: "boolean",
              default: true
            },
            maxListItemsOnLine: {
              type: "number",
              default: 3
            },
            statementDelimiter: {
              type: "string",
              default: ";"
            },
            routineDelimiter: {
              type: "string",
              default: ";"
            },
            keywordCase: {
              type: "string",
              enum: ["upper", "lower"]
            },
            identiferCase: {
              type: "string",
              enum: ["upper", "lower", "original"],
              default: "original"
            },
            quotation: {
              type: "string",
              enum: ["if_needed", "always"],
              "x-platforms": ["PG", "MYSQL", "MARIADB", "MSSQL"]
            },
            includeSchema: {
              type: "string",
              enum: ["always", "never", "when_differs"],
              "x-platforms": ["PG", "MYSQL", "MARIADB", "MSSQL"]
            },
            includeGeneratedNames: {
              type: "string",
              enum: ["always", "custom_names_only", "never"],
              "x-platforms": ["PG"]
            },
            quotationType: {
              type: "string",
              enum: ["double_quotes", "square_brackets"],
              "x-platforms": ["MSSQL"]
            }
          },
          required: [
            "wrapLines",
            "wrapOffset",
            "indent",
            "indentationString",
            "indentationSize",
            "limitItemsOnLine",
            "maxListItemsOnLine",
            "statementDelimiter",
            "routineDelimiter",
            "keywordCase",
            "identiferCase"
          ]
        },
        nameAutoGeneration: {
          type: "object",
          properties: {
            keys: {
              type: "boolean"
            },
            indexes: {
              type: "boolean"
            },
            relations: {
              type: "boolean"
            }
          },
          "x-platforms": ["PG"]
        },
        connectionId: {
          $ref: "#/$defs/ConnectionReference"
        },
        beforeScript: {
          type: "string",
          "x-caption": "Before script"
        },
        afterScript: {
          type: "string",
          "x-caption": "After script"
        },
        def_charset: {
          type: "string",
          "x-platforms": ["MARIADB", "MYSQL"]
        },
        def_collation: {
          type: "string",
          "x-platforms": ["MARIADB", "MYSQL"]
        },
        def_rowformat: {
          type: "string",
          "x-platforms": ["MARIADB", "MYSQL"]
        },
        def_tabletype: {
          type: "string",
          "x-platforms": ["MARIADB", "MYSQL"]
        },
        def_database: {
          type: "string",
          "x-platforms": ["MARIADB", "MYSQL"]
        },
        def_others: {
          type: "string",
          "x-platforms": ["MARIADB", "MYSQL"]
        },
        mssql: {
          type: "object",
          properties: {
            schema: {
              type: "string",
              "x-platforms": ["MSSQL"]
            }
          },
          "x-platforms": ["MSSQL"],
          "x-destruct": ["diff_html_reports"]
        }
      }
    },
    DiagramReference: {
      type: "string",
      "x-type": "id-ref",
      "x-ref-path": [["diagrams"]]
    },
    Selections: {
      type: "object",
      patternProperties: {
        "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$": {
          type: "object",
          properties: {
            objectType: {
              type: "string"
            },
            id: {
              type: "string"
            }
          },
          required: ["objectType"]
        }
      }
    },
    ConnectionReference: {
      type: ["string", "null"],
      "x-type": "id-ref",
      "x-ref-path": [["connections"]]
    },
    Connections: {
      type: "object",
      properties: {
        "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$": {
          type: "object",
          properties: {
            id: {
              $ref: "#/$defs/Id"
            },
            name: {
              type: "string"
            },
            desc: {
              type: "string"
            },
            type: {
              type: "string",
              enum: ["SQLITE"]
            },
            database: {
              type: "string"
            },
            filePath: {
              type: "string",
              "x-platforms": ["SQLITE"]
            }
          },
          "x-type": "key-id",
          required: ["id", "name", "desc", "database"]
        }
      }
    },
    ModelsSamples: {
      type: "object",
      patternProperties: {
        "^[.]+$": {
          type: "object",
          properties: {
            id: {
              type: "string"
            },
            name: {
              type: "string"
            },
            description: {
              type: "string"
            },
            articleLink: {
              type: "string"
            },
            url: {
              type: "string"
            },
            type: {
              type: "string",
              enum: ["MONGODB"]
            }
          }
        }
      }
    },
    Notifications: {
      type: "object",
      patternProperties: {
        "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$": {
          type: "object",
          properties: {
            id: {
              $ref: "#/$defs/Id"
            },
            datepast: {
              type: "string"
            },
            datesort: {
              type: "number"
            },
            date: {
              type: "string"
            },
            message: {
              type: "string"
            },
            model: {
              type: "string"
            },
            type: {
              type: "string",
              enum: ["warning", "error", "info"]
            },
            autohide: {
              type: "boolean"
            }
          },
          "x-type": "key-id"
        }
      }
    },
    AppLatestVersion: {
      type: "object",
      properties: {
        status: {
          type: "number"
        },
        status_message: {
          type: "string"
        },
        data: {
          type: "null"
        }
      }
    },
    Profile: {
      type: "object",
      properties: {
        appLatestVersion: {
          $ref: "#/$defs/AppLatestVersion"
        },
        availableFeatures: {
          type: "array",
          items: {
            type: "string",
            enum: [
              "json",
              "tls",
              "ssh",
              "multidiagrams",
              "reports",
              "connections",
              "disabled_connections",
              "update",
              "import_from_file",
              "disabled_import_from_file",
              "import_from_url",
              "freeware"
            ]
          }
        },
        appInfo: {
          type: "object",
          properties: {
            appName: {
              type: "string"
            },
            appVersion: {
              type: "string"
            },
            trialDays: {
              type: "number"
            },
            remainingDays: {
              type: "number"
            },
            installDate: {
              type: "string"
            },
            diffDays: {
              type: "number"
            }
          }
        },
        licInfo: {
          type: "object",
          properties: {
            success: {
              type: "boolean"
            },
            uses: {
              type: "number"
            },
            purchase: {
              type: "object"
            },
            key: {
              type: "string"
            },
            created: {
              type: "number"
            },
            licType: {
              type: "string"
            }
          }
        }
      }
    },
    Settings: {
      type: "object",
      required: ["defaultPath", "showTips", "proxy"],
      properties: {
        defaultPath: {
          type: "string"
        },
        backupModelTime: {
          type: "string",
          enum: ["never", "5seconds", "minute", "5minutes"],
          default: "5seconds"
        },
        showTips: {
          type: "boolean",
          default: true
        },
        proxy: {
          type: "object",
          properties: {
            enabled: {
              type: "boolean",
              default: false
            },
            url: {
              type: "string"
            },
            port: {
              type: "string"
            },
            user: {
              type: "string"
            },
            password: {
              type: "string"
            }
          },
          "x-serializable-app-encrypted": true,
          required: ["url", "port", "user", "password"]
        },
        theme: {
          type: "string",
          enum: ["", "im-dark"]
        },
        undoSteps: {
          type: "number",
          default: 60
        },
        showToolbarCaptions: {
          type: "boolean",
          default: true
        },
        eula_im: {
          type: "boolean",
          default: false
        },
        showAllObjectsInList: {
          type: "boolean",
          default: false
        },
        layout: {
          type: "string",
          enum: ["area-center"]
        }
      }
    },
    OrderObjectReference: {
      type: "string",
      pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
      "x-type": "id-ref",
      "x-ref-path": [["tables"], ["otherObjects"], ["lines"], ["relations"]]
    },
    AnyObjectReference: {
      type: "string",
      pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
      "x-type": "id-ref",
      "x-ref-path": [
        ["tables"],
        ["tables", "*", "cols"],
        ["tables", "*", "indexes"],
        ["otherObjects"],
        ["notes"]
      ]
    },
    RelationReference: {
      type: "string",
      pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
      "x-type": "id-ref",
      "x-ref-path": [["relations"]]
    }
  }
};
