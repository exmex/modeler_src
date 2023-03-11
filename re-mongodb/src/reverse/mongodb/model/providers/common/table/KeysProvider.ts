import { Column, Key } from "common";

import { v4 as uuidv4 } from "uuid";

export class KeysProvider {
  public provide(cols: Column[]): Key[] {
    let result: Key[] = [];
    const idColumn = cols.find((col) => col.name === "_id");
    if (idColumn) {
      result = [
        {
          cols: [
            {
              colid: idColumn.id,
              id: uuidv4()
            }
          ],
          id: uuidv4(),
          isPk: true,
          name: "Primary key"
        }
      ];
    }

    return result;
  }
}
