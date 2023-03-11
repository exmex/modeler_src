class ModelBuilder {
  build({
    tables,
    relations,
    notes,
    lines,
    model,
    otherObjects,
    diagrams,
    order
  }) {
    const result = {};
    result.tables = tables;
    result.relations = relations;
    result.notes = notes;
    result.lines = lines;
    result.model = model;
    result.otherObjects = otherObjects;
    result.diagrams = diagrams;
    result.order = order;
    return JSON.stringify(result);
  }
}

export default ModelBuilder;
