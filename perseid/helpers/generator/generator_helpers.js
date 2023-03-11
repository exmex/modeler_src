import JsonSchemaHelpers from "../../platforms/jsonschema/helpers_jsonschema";
import { ModelTypes } from "../../enums/enums";

const GeneratorHelpers = {
  hasSqlGenerationSettings(type) {
    return (
      type === ModelTypes.MYSQL ||
      type === ModelTypes.MARIADB ||
      type === ModelTypes.PG ||
      type === ModelTypes.SQLITE
    );
  },

  hasJsonGenerationSettings(type) {
    return JsonSchemaHelpers.isPerseidModelType(type);
  }
};
export default GeneratorHelpers;
