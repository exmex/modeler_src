import draft04 from "../default_schemas/json-schema.org/draft-04/schema";

export const getRefSchema = (schema, property) => {
  try {
    return parseFromURL({ property });
  } catch {
    return parseFromArraySplit({ schema, property });
  }
};

const parseFromURL = ({ property }) => {
  const url = new URL(property.$ref);
  const foreignSchema = getSchemaByURL(url);

  return parseFromArraySplit({
    schema: foreignSchema,
    property: { $ref: url.hash }
  });
};

const getSchemaByURL = (url) => {
  if (
    url.origin === "http://json-schema.org" &&
    url.pathname === "/draft-04/schema"
  ) {
    return draft04;
  }
};

const parseFromArraySplit = ({ schema, property }) => {
  const refPath = property.$ref.split("/");
  if (refPath.length > 0) {
    let targetSchema = schema;
    let index = refPath[0] === "#" ? 1 : 0;
    while (index < refPath.length && !!targetSchema) {
      targetSchema = targetSchema[refPath[index]];
      index++;
    }
    return targetSchema;
  }
  return undefined;
};
