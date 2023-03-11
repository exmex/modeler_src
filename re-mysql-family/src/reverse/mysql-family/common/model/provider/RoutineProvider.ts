import { KnownIdRegistry, ModelPartProvider, QueryExecutor } from "re";
import { OtherObject, OtherObjects } from "common";

import { MySQLFamilyFeatures } from "../../MySQLFamilyFeatures";
import { RoutineMetadata } from "../../metadata/RoutineMetadata";
import { RoutineParameter } from "../../generator/RoutineParameter";
import { RoutineSourceGenerator } from "../../generator/RoutineSourceGenerator";
import { v4 as uuidv4 } from "uuid";

interface ParameterMetadataRow {
  PARAMETER_MODE: string;
  PARAMETER_NAME: string;
  DTD_IDENTIFIER: string;
  SPECIFIC_NAME: string;
  TYPE: string;
}
interface RoutineMetadataRow {
  TYPE: string;
  DEFINER: string;
  ROUTINE_NAME: string;
  IS_DETERMINISTIC: boolean;
  SQL_DATA_ACCESS: string;
  SECURITY_TYPE: string;
  ROUTINE_COMMENT: string;
  ROUTINE_DEFINITION: string;
  DTD_IDENTIFIER: string;
  AGGREGATE: string;
}

const QUERY_PARAMS =
  `SELECT ROUTINE_TYPE as TYPE, SPECIFIC_NAME, PARAMETER_MODE, PARAMETER_NAME, DTD_IDENTIFIER FROM\n` +
  `information_schema.parameters WHERE ORDINAL_POSITION <> 0 AND ROUTINE_TYPE = ?\n` +
  `AND SPECIFIC_SCHEMA = ? ORDER BY SPECIFIC_NAME, ORDINAL_POSITION\n`;

const aggregateAvailable = (features: MySQLFamilyFeatures) => {
  return (
    features.aggregateFunction() === true &&
    features.schemaMySQLAvailable() === true
  );
};

const getQueryRoutinesWithAggregates = (features: MySQLFamilyFeatures) => {
  return (
    `SELECT\n ` +
    `r.ROUTINE_TYPE AS TYPE,\n` +
    `r.DTD_IDENTIFIER,\n` +
    `r.DEFINER,\n` +
    `r.ROUTINE_NAME,\n` +
    `r.IS_DETERMINISTIC,\n` +
    `r.SQL_DATA_ACCESS,\n` +
    `r.SECURITY_TYPE,\n` +
    `r.ROUTINE_COMMENT,\n` +
    `r.ROUTINE_DEFINITION,\n` +
    `${
      aggregateAvailable(features) === true ? `p.aggregate` : `'NONE'`
    }  AS AGGREGATE\n` +
    `FROM information_schema.routines r\n` +
    `${
      aggregateAvailable(features) === true
        ? `JOIN mysql.proc p\n` +
          `ON  r.ROUTINE_NAME = p.name\n` +
          `    and r.ROUTINE_SCHEMA = p.db\n`
        : ``
    }` +
    `WHERE ROUTINE_TYPE = ? AND r.ROUTINE_SCHEMA = ?\n`
  );
};

const getQueryRoutines = () => {
  return (
    `SELECT\n ` +
    `r.ROUTINE_TYPE AS TYPE,\n` +
    `r.DTD_IDENTIFIER,\n` +
    `r.DEFINER,\n` +
    `r.ROUTINE_NAME,\n` +
    `r.IS_DETERMINISTIC,\n` +
    `r.SQL_DATA_ACCESS,\n` +
    `r.SECURITY_TYPE,\n` +
    `r.ROUTINE_COMMENT,\n` +
    `r.ROUTINE_DEFINITION,\n` +
    `'NONE' AS AGGREGATE\n` +
    `FROM information_schema.routines r\n` +
    `WHERE ROUTINE_TYPE = ? AND r.ROUTINE_SCHEMA = ?\n`
  );
};

export class MySQLFamilyRoutineProvider
  implements ModelPartProvider<OtherObjects>
{
  public constructor(
    private queryExecutor: QueryExecutor,
    private schema: string,
    private type: string,
    private features: MySQLFamilyFeatures,
    private knownIdRegistry: KnownIdRegistry
  ) {}

  public async provide(): Promise<OtherObjects> {
    const result: OtherObjects = {};
    const routinesMetadata = new Map<string, RoutineMetadata>();

    await this.addRoutines(routinesMetadata);
    await this.addParams(routinesMetadata);

    routinesMetadata.forEach((routineMetadata: RoutineMetadata): void => {
      const schema = "";
      const name = routineMetadata.name;
      const type = routineMetadata.type
        .toLowerCase()
        .replace(/./, (x: string): string => x.toUpperCase());
      const id = this.knownIdRegistry.getOtherObjectId(schema, name, type);

      const generator = new RoutineSourceGenerator(routineMetadata);

      const code = generator.generate();
      const routine = this.createRoutine(
        id,
        code,
        routineMetadata.name,
        routineMetadata.comment,
        type
      );
      result[id] = routine;
    });

    return result;
  }

  private createRoutine(
    id: string,
    code: string,
    name: string,
    desc: string,
    type: string
  ): OtherObject {
    return {
      id,
      visible: true,
      name,
      desc,
      type,
      code,
      lines: [],
      generate: true,
      generateCustomCode: true
    };
  }

  private async addParams(
    routinesMetadata: Map<string, RoutineMetadata>
  ): Promise<void> {
    const queryResult = await this.queryExecutor.query(QUERY_PARAMS, [
      this.type,
      this.schema
    ]);

    queryResult.forEach((row: ParameterMetadataRow): void => {
      const routineParameter = new RoutineParameter(
        row.PARAMETER_MODE === "IN",
        row.PARAMETER_MODE === "OUT",
        row.PARAMETER_MODE === "INOUT",
        row.PARAMETER_NAME,
        row.DTD_IDENTIFIER
      );
      const routineMetadata = routinesMetadata.get(row.SPECIFIC_NAME);
      if (routineMetadata) {
        routineMetadata.parameters.push(routineParameter);
      }
    });
  }

  private async getQueryResult() {
    try {
      return await this.queryExecutor.query(
        getQueryRoutinesWithAggregates(this.features),
        [this.type, this.schema]
      );
    } catch {
      return await this.queryExecutor.query(getQueryRoutines(), [
        this.type,
        this.schema
      ]);
    }
  }

  private async addRoutines(
    routinesMetadata: Map<string, RoutineMetadata>
  ): Promise<void> {
    const queryResult = await this.getQueryResult();
    queryResult.forEach((row: RoutineMetadataRow): void => {
      const routineMetadata = new RoutineMetadata(
        row.TYPE,
        row.DTD_IDENTIFIER,
        row.DEFINER,
        row.AGGREGATE === "GROUP",
        row.ROUTINE_NAME,
        row.IS_DETERMINISTIC,
        row.SQL_DATA_ACCESS,
        row.SECURITY_TYPE,
        row.ROUTINE_COMMENT,
        row.ROUTINE_DEFINITION
      );
      routinesMetadata.set(routineMetadata.name, routineMetadata);
    });
  }
}
