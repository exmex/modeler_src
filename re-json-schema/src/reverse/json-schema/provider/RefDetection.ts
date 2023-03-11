export const getRefSchema = (schema: any, property: any) => {
  return parseFromArraySplit({ schema, property });
};

const parseFromArraySplit = ({
  schema,
  property
}: {
  schema: any;
  property: any;
}) => {
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
