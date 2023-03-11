export const DefaultGeneratorOptionsSQLite = {
  useRoutineDelimiter: false,
  onlyActiveDiagram: false,
  previewObject: true,
  generateNested: true
};

export const DiffGeneratorOptionsSQLite = {
  useRoutineDelimiter: false,
  onlyActiveDiagram: false,
  previewObject: true,
  generateNested: false
};

export const DefaultGeneratorOptionsPG = (sqlSettings) => ({
  generateNested: true,
  useRoutineDelimiter: false,
  onlyActiveDiagram: false,
  previewObject: true,
  includeGeneratedNames: sqlSettings.includeGeneratedNames
});

export const DefaultGeneratorOptionsMSSQL = (sqlSettings) => ({
  generateNested: true,
  useRoutineDelimiter: false,
  onlyActiveDiagram: false,
  previewObject: true,
  includeGeneratedNames: sqlSettings.includeGeneratedNames,
  includeSchema: sqlSettings.includeSchema
});

export const DiffGeneratorOptionsPG = (sqlSettings) => ({
  generateNested: false,
  useRoutineDelimiter: false,
  onlyActiveDiagram: false,
  previewObject: true,
  includeGeneratedNames: sqlSettings.includeGeneratedNames
});

export const DiffGeneratorOptionsMSSQL = (sqlSettings) => ({
  generateNested: false,
  useRoutineDelimiter: false,
  onlyActiveDiagram: false,
  previewObject: true,
  includeGeneratedNames: sqlSettings.includeGeneratedNames,
  includeSchema: sqlSettings.includeSchema
});

export const DefaultGeneratorOptionsMySQLFamily = {
  generateNested: true,
  useRoutineDelimiter: true,
  onlyActiveDiagram: false,
  previewObject: true
};

export const DiffGeneratorOptionsMySQLFamily = {
  generateNested: false,
  useRoutineDelimiter: true,
  onlyActiveDiagram: false,
  previewObject: true
};
