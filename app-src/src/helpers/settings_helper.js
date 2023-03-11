function filterModelSettings(model) {
  return {
    modelScriptFilePath: model.modelScriptFilePath,
    modelHTMLReportDir: model.modelHTMLReportDir,
    modelPdfReportPath: model.modelPdfReportPath,
    modelScriptsDir: model.modelScriptsDir
  };
}

module.exports = { filterModelSettings };
