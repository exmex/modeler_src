export class ToSQLModel {
  constructor(sqlModelBuilder, finder, generatorOptions) {
    this.sb = sqlModelBuilder;
    this.finder = finder;
    this.generatorOptions = generatorOptions;
  }

  convert() {
    // intentionally empty
  }

  shouldComment() {
    return true;
  }
}
