export const DefaultGeneratorOptions = {
  useRoutineDelimiter: false,
  onlyActiveDiagram: false,
  previewObject: true
};

export const DefaultGeneratorOptionsPG = (sqlSettings) => ({
  useRoutineDelimiter: false,
  onlyActiveDiagram: false,
  previewObject: true,
  includeGeneratedNames: sqlSettings.includeGeneratedNames
});

export const DefaultMySqlFamilyGeneratorOptions = {
  useRoutineDelimiter: true,
  onlyActiveDiagram: false,
  previewObject: true
};
