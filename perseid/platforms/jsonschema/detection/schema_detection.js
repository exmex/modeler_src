import { ModelTypes } from "common";
import v_2_0 from "../default_schemas/openapi/v2.0.js";
import v_3_0 from "../default_schemas/openapi/v3.0.js";
import v_3_1 from "../default_schemas/openapi/v3.1.js";

export const getActiveSchema = ({ root, type }) => {
  if (type === ModelTypes.OPENAPI) {
    switch (root?.schema?.substring(0, 3)) {
      case "2.0":
        return v_2_0;
      case "3.0":
        return v_3_0;
      case "3.1":
        return v_3_1;
      default:
        return undefined;
    }
  }
  return undefined;
};
