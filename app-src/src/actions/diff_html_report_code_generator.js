import {
  DefaultGeneratorOptionsMSSQL,
  DefaultGeneratorOptionsMySQLFamily,
  DiffGeneratorOptionsMSSQL,
  DiffGeneratorOptionsMySQLFamily,
  DiffGeneratorOptionsPG,
  DiffGeneratorOptionsSQLite
} from "../generator/model-to-sql-model/generator_options";
import { ModelTypes, getModelNode, pathToString } from "common";
import {
  generateCreateDomainSQL as generateCreateDomainSQLPg,
  generateCreateEnumSQL as generateCreateEnumSQLPg,
  generateCreateIndexSQL as generateCreateIndexSQLPg,
  generateCreateTableSQL as generateCreateTableSQLPg,
  generateRelationSQL as generateRelationSQLPg
} from "../platforms/pg/generator/generator_sql_pg";
import {
  generateCreateIndexSQL as generateCreateIndexSQLMSSQL,
  generateCreateSequenceSQL as generateCreateSequenceSQLMSSQL,
  generateCreateTableSQL as generateCreateTableSQLMSSQL,
  generateCreateUserDefinedTypeSQL as generateCreateUserDefinedTypeSQLMSSQL,
  generateRelationSQL as generateRelationSQLMSSQL
} from "../platforms/mssql/generator/generator_sql_mssql";
import {
  generateCreateIndexSQL as generateCreateIndexSQLMySQLFamily,
  generateCreateTableSQL as generateCreateTableSQLMySQLFamily,
  generateRelationSQL as generateRelationSQLMySQLFamily
} from "../platforms/mysql_family/generator/generator_sql_mysql_family";
import {
  generateCreateIndexSQL as generateCreateIndexSQLSQLite,
  generateCreateTableSQL as generateCreateTableSQLSQLite,
  generateRelationSQL as generateRelationSQLSQLite
} from "../platforms/sqlite/generator/generator_sql_sqlite";

import _ from "lodash";

export class DiffHTMLReportCodeGenerator {
  constructor(model) {
    this.model = model;
    this.modelType = model?.model?.type;
  }

  generateSQLite(instancePath) {
    let result = undefined;
    const modelNode = getModelNode(this.model, pathToString(instancePath));

    if (modelNode) {
      const isTableType =
        _.size(instancePath) === 2 && instancePath?.[0] === "tables";
      const isRelation =
        _.size(instancePath) === 2 && instancePath?.[0] === "relations";
      const isIndexType =
        _.size(instancePath) === 4 &&
        instancePath?.[0] === "tables" &&
        instancePath?.[2] === "indexes";
      const isViewType =
        _.size(instancePath) === 2 &&
        instancePath?.[0] === "otherObjects" &&
        modelNode?.type === "View";
      const isTriggerType =
        _.size(instancePath) === 2 &&
        instancePath?.[0] === "otherObjects" &&
        modelNode?.type === "Trigger";

      if (isViewType) {
        result = modelNode.generate === true ? modelNode.code : undefined;
      }

      if (isTriggerType) {
        result = modelNode.generate === true ? modelNode.code : undefined;
      }

      if (isTableType) {
        result = generateCreateTableSQLSQLite(
          this.model.model.sqlSettings,
          this.model,
          modelNode,
          DiffGeneratorOptionsSQLite
        );
      }

      if (isIndexType) {
        const tableModelNode = getModelNode(
          this.model,
          pathToString([instancePath[0], instancePath[1]])
        );

        result = generateCreateIndexSQLSQLite(
          this.model.model.sqlSettings,
          this.model,
          tableModelNode,
          modelNode
        );
      }

      if (isRelation) {
        result = generateRelationSQLSQLite(
          this.model.model.sqlSettings,
          this.model,
          modelNode
        );
      }
    }
    return result;
  }

  generateMySQLFamily(instancePath) {
    let result = undefined;
    const modelNode = getModelNode(this.model, pathToString(instancePath));

    if (modelNode) {
      const isTableType =
        _.size(instancePath) === 2 && instancePath?.[0] === "tables";
      const isRelation =
        _.size(instancePath) === 2 && instancePath?.[0] === "relations";
      const isIndexType =
        _.size(instancePath) === 4 &&
        instancePath?.[0] === "tables" &&
        instancePath?.[2] === "indexes";
      const isViewType =
        _.size(instancePath) === 2 &&
        instancePath?.[0] === "otherObjects" &&
        modelNode?.type === "View";
      const isTriggerType =
        _.size(instancePath) === 2 &&
        instancePath?.[0] === "otherObjects" &&
        modelNode?.type === "Trigger";
      const isFunctionType =
        _.size(instancePath) === 2 &&
        instancePath?.[0] === "otherObjects" &&
        modelNode?.type === "Function";
      const isProcedureType =
        _.size(instancePath) === 2 &&
        instancePath?.[0] === "otherObjects" &&
        modelNode?.type === "Procedure";

      if (isViewType) {
        result = modelNode.generate === true ? modelNode.code : undefined;
      }

      if (isTriggerType) {
        result = modelNode.generate === true ? modelNode.code : undefined;
      }

      if (isFunctionType) {
        result = modelNode.generate === true ? modelNode.code : undefined;
      }

      if (isProcedureType) {
        result = modelNode.generate === true ? modelNode.code : undefined;
      }

      if (isTableType) {
        result = generateCreateTableSQLMySQLFamily(
          this.model.model.sqlSettings,
          this.model,
          modelNode,
          DiffGeneratorOptionsMySQLFamily
        );
      }

      if (isIndexType) {
        const tableModelNode = getModelNode(
          this.model,
          pathToString([instancePath[0], instancePath[1]])
        );

        result = generateCreateIndexSQLMySQLFamily(
          this.model.model.sqlSettings,
          this.model,
          tableModelNode,
          modelNode,
          DefaultGeneratorOptionsMySQLFamily
        );
      }

      if (isRelation) {
        result = generateRelationSQLMySQLFamily(
          this.model.model.sqlSettings,
          this.model,
          modelNode
        );
      }

      if (isViewType) {
        result = modelNode.generate === true ? modelNode.code : undefined;
      }

      if (isTriggerType) {
        result = modelNode.generate === true ? modelNode.code : undefined;
      }

      if (isFunctionType) {
        result = modelNode.generate === true ? modelNode.code : undefined;
      }
      if (isProcedureType) {
        result = modelNode.generate === true ? modelNode.code : undefined;
      }
    }
    return result;
  }

  generatePg(instancePath) {
    let result = undefined;
    const modelNode = getModelNode(this.model, pathToString(instancePath));

    if (modelNode) {
      const isTableType =
        _.size(instancePath) === 2 &&
        instancePath?.[0] === "tables" &&
        modelNode?.objectType === "table";
      const isCompositeType =
        _.size(instancePath) === 2 &&
        instancePath?.[0] === "tables" &&
        modelNode?.objectType === "composite";
      const isRelation =
        _.size(instancePath) === 2 && instancePath?.[0] === "relations";
      const isIndexType =
        _.size(instancePath) === 4 &&
        instancePath?.[0] === "tables" &&
        instancePath?.[2] === "indexes";
      const isViewType =
        _.size(instancePath) === 2 &&
        instancePath?.[0] === "otherObjects" &&
        modelNode?.type === "View";
      const isMViewType =
        _.size(instancePath) === 2 &&
        instancePath?.[0] === "otherObjects" &&
        modelNode?.type === "MaterializedView";
      const isFunctionType =
        _.size(instancePath) === 2 &&
        instancePath?.[0] === "otherObjects" &&
        modelNode?.type === "Function";
      const isProcedureType =
        _.size(instancePath) === 2 &&
        instancePath?.[0] === "otherObjects" &&
        modelNode?.type === "Procedure";
      const isRuleType =
        _.size(instancePath) === 2 &&
        instancePath?.[0] === "otherObjects" &&
        modelNode?.type === "Rule";
      const isPolicyType =
        _.size(instancePath) === 2 &&
        instancePath?.[0] === "otherObjects" &&
        modelNode?.type === "Policy";
      const isSequenceType =
        _.size(instancePath) === 2 &&
        instancePath?.[0] === "otherObjects" &&
        modelNode?.type === "Sequence";
      const isEnumType =
        _.size(instancePath) === 2 &&
        instancePath?.[0] === "otherObjects" &&
        modelNode?.type === "Enum";
      const isDomainType =
        _.size(instancePath) === 2 &&
        instancePath?.[0] === "otherObjects" &&
        modelNode?.type === "Domain";
      const isTriggerType =
        _.size(instancePath) === 2 &&
        instancePath?.[0] === "otherObjects" &&
        modelNode?.type === "Trigger";

      if (isViewType) {
        result = modelNode.generate === true ? modelNode.code : undefined;
      }

      if (isMViewType) {
        result = modelNode.generate === true ? modelNode.code : undefined;
      }

      if (isFunctionType) {
        result = modelNode.generate === true ? modelNode.code : undefined;
      }

      if (isProcedureType) {
        result = modelNode.generate === true ? modelNode.code : undefined;
      }

      if (isViewType) {
        result = modelNode.generate === true ? modelNode.code : undefined;
      }

      if (isRuleType) {
        result = modelNode.generate === true ? modelNode.code : undefined;
      }

      if (isPolicyType) {
        result = modelNode.generate === true ? modelNode.code : undefined;
      }

      if (isSequenceType) {
        result = modelNode.generate === true ? modelNode.code : undefined;
      }

      if (isEnumType) {
        result = generateCreateEnumSQLPg(
          this.model.model.sqlSettings,
          this.model,
          modelNode
        );
      }

      if (isDomainType) {
        result = generateCreateDomainSQLPg(
          this.model.model.sqlSettings,
          this.model,
          modelNode
        );
      }

      if (isTriggerType) {
        result = modelNode.generate === true ? modelNode.code : undefined;
      }

      if (isTableType) {
        result = generateCreateTableSQLPg(
          this.model.model.sqlSettings,
          this.model,
          modelNode,
          DiffGeneratorOptionsPG(this.model.model.sqlSettings)
        );
      }

      if (isCompositeType) {
        result = generateCreateTableSQLPg(
          this.model.model.sqlSettings,
          this.model,
          modelNode,
          DiffGeneratorOptionsPG(this.model.model.sqlSettings)
        );
      }
      if (isIndexType) {
        const tableModelNode = getModelNode(
          this.model,
          pathToString([instancePath[0], instancePath[1]])
        );

        result = generateCreateIndexSQLPg(
          this.model.model.sqlSettings,
          this.model,
          tableModelNode,
          modelNode,
          DiffGeneratorOptionsPG(this.model.model.sqlSettings)
        );
      }

      if (isRelation) {
        result = generateRelationSQLPg(
          this.model.model.sqlSettings,
          this.model,
          modelNode
        );
      }
    }
    return result;
  }

  generateMSSQL(instancePath) {
    let result = undefined;
    const modelNode = getModelNode(this.model, pathToString(instancePath));

    if (modelNode) {
      const isTableType =
        _.size(instancePath) === 2 &&
        instancePath?.[0] === "tables" &&
        modelNode?.objectType === "table";
      const isRelation =
        _.size(instancePath) === 2 && instancePath?.[0] === "relations";
      const isIndexType =
        _.size(instancePath) === 4 &&
        instancePath?.[0] === "tables" &&
        instancePath?.[2] === "indexes";
      const isViewType =
        _.size(instancePath) === 2 &&
        instancePath?.[0] === "otherObjects" &&
        modelNode?.type === "View";
      const isFunctionType =
        _.size(instancePath) === 2 &&
        instancePath?.[0] === "otherObjects" &&
        modelNode?.type === "Function";
      const isProcedureType =
        _.size(instancePath) === 2 &&
        instancePath?.[0] === "otherObjects" &&
        modelNode?.type === "Procedure";
      const isSequenceType =
        _.size(instancePath) === 2 &&
        instancePath?.[0] === "otherObjects" &&
        modelNode?.type === "Sequence";
      const isTriggerType =
        _.size(instancePath) === 2 &&
        instancePath?.[0] === "otherObjects" &&
        modelNode?.type === "Trigger";

      const isUserDefinedType =
        _.size(instancePath) === 2 &&
        instancePath?.[0] === "otherObjects" &&
        modelNode?.type === "UserDefinedType";

      if (isViewType) {
        result = modelNode.generate === true ? modelNode.code : undefined;
      }

      if (isFunctionType) {
        result = modelNode.generate === true ? modelNode.code : undefined;
      }

      if (isProcedureType) {
        result = modelNode.generate === true ? modelNode.code : undefined;
      }

      if (isTriggerType) {
        result = modelNode.generate === true ? modelNode.code : undefined;
      }

      if (isTableType) {
        result = generateCreateTableSQLMSSQL(
          this.model.model.sqlSettings,
          this.model,
          modelNode,
          DiffGeneratorOptionsMSSQL(this.model.model.sqlSettings)
        );
      }

      if (isIndexType) {
        const tableModelNode = getModelNode(
          this.model,
          pathToString([instancePath[0], instancePath[1]])
        );

        result = generateCreateIndexSQLMSSQL(
          this.model.model.sqlSettings,
          this.model,
          tableModelNode,
          modelNode,
          DiffGeneratorOptionsMSSQL(this.model.model.sqlSettings)
        );
      }

      if (isRelation) {
        result = generateRelationSQLMSSQL(
          this.model.model.sqlSettings,
          this.model,
          modelNode
        );
      }

      if (isSequenceType) {
        result = generateCreateSequenceSQLMSSQL(
          this.model.model.sqlSettings,
          this.model,
          modelNode
        );
      }

      if (isUserDefinedType) {
        result = generateCreateUserDefinedTypeSQLMSSQL(
          this.model.model.sqlSettings,
          this.model,
          modelNode
        );
      }
    }

    return result;
  }
  generate(instancePath) {
    switch (this.modelType) {
      case ModelTypes.SQLITE:
        return this.generateSQLite(instancePath);
      case ModelTypes.PG:
        return this.generatePg(instancePath);
      case ModelTypes.MSSQL:
        return this.generateMSSQL(instancePath);
      case ModelTypes.MYSQL:
      case ModelTypes.MARIADB:
        return this.generateMySQLFamily(instancePath);
      default:
        return undefined;
    }
  }
}
