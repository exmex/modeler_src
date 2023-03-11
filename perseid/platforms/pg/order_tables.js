export const orderTablesByInheritance = all => {
  const visited = [];
  const registered = [];
  all
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach(table => registerParents(table, registered, all, visited));
  return registered;
};

const parseInherits = (inherits, all) => {
  if (inherits) {
    try {
      const parsedNames = Array.from(inherits.matchAll(/"([^"]+)"|(\w+)/g)).map(
        result => {
          return result[2] ? result[2] : result[1];
        }
      );
      return parsedNames
        ? all.filter(item => parsedNames.includes(item.name))
        : [];
    } catch {
      return [];
    }
  }
  return [];
};

const registerParents = (table, registered, all, visited) => {
  if (registered.includes(table) || visited.includes(table)) {
    return;
  }
  const parentTables = table.pg ? parseInherits(table.pg.inherits, all) : [];

  parentTables
    .filter(parent => parent !== table)
    .forEach(parent => {
      registerParents(parent, registered, all, [...visited, table]);
      if (!registered.includes(parent)) {
        registered.push(parent);
      }
    });

  if (!registered.includes(table)) {
    registered.push(table);
  }
};
