import { ModelObjects, Tables } from "common";

export class PgPartitionTableCleaner {
  public cleanup(modelObjects: ModelObjects) {
    const partitionNames = Object.keys(modelObjects.tables)
      .map((key) => modelObjects.tables[key].pg?.partitionNames)
      .reduce<string[]>((r, i) => (i ? [...r, ...i] : r), []);

    return {
      tables: Object.keys(modelObjects.tables)
        .map((key) => modelObjects.tables[key])
        .filter(
          (table) =>
            !partitionNames.find(
              (partitionName) => partitionName === table.name
            )
        )
        .reduce<Tables>((result, item) => ({ ...result, [item.id]: item }), {}),
      relations: modelObjects.relations,
      otherObjects: modelObjects.otherObjects
    };
  }
}
