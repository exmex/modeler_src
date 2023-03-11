import _ from "lodash";

export const getGraphQlEnumStatement = (otherObject, generatorOptions) => {
  var code = "";
  if (otherObject !== null) {
    code = generateObjectComment(otherObject, generatorOptions);
    if (
      otherObject.generate === true ||
      generatorOptions.previewObject === true
    ) {
      code += "enum " + otherObject.name + " ";
      code += otherObject.directive ? otherObject.directive : "";
      code += "{\n";
      code += otherObject.enumValues ? otherObject.enumValues : "";
      code += "\n}";
    }

    if (
      otherObject.generateCustomCode === true &&
      generatorOptions.previewObject === false
    ) {
      otherObject.customCode &&
        (code += "\n\n" + otherObject.customCode + "\n");
    }

    code += "\n\n";
    return code;
  }
};

export const getGraphQlScalarStatement = (otherObject, generatorOptions) => {
  var code = "";
  if (otherObject !== null) {
    code = generateObjectComment(otherObject, generatorOptions);
    if (
      otherObject.generate === true ||
      generatorOptions.previewObject === true
    ) {
      code += "scalar " + otherObject.name + " ";
      code += otherObject.directive ? otherObject.directive : "";
      code += "\n";
    }

    if (
      otherObject.generateCustomCode === true &&
      generatorOptions.previewObject === false
    ) {
      otherObject.customCode &&
        (code += "\n\n" + otherObject.customCode + "\n\n");
    }
    return code;
  }
};

export const getSimpleOtherObjectStatement = (
  otherObject,
  generatorOptions
) => {
  var code = "";
  if (otherObject !== null) {
    code = generateObjectComment(otherObject, generatorOptions);
    if (
      otherObject.generate === true ||
      generatorOptions.previewObject === true
    ) {
      code += otherObject.code;
      code += "\n\n";
    }

    if (
      otherObject.generateCustomCode === true &&
      generatorOptions.previewObject === false
    ) {
      otherObject.customCode &&
        (code += "\n\n" + otherObject.customCode + "\n\n");
    }
    return code;
  }
};

const shouldGenerateDiagramObjecstOnly = (
  id,
  { onlyActiveDiagram, diagramObjects }
) => {
  return onlyActiveDiagram === true && diagramObjects[id] ? true : false;
};

export const shouldGenerate = (id, { onlyActiveDiagram, diagramObjects }) => {
  return (
    shouldGenerateDiagramObjecstOnly(id, {
      onlyActiveDiagram,
      diagramObjects
    }) || !onlyActiveDiagram
  );
};

export const getOtherObjectStatement = (
  otherObject,
  generatorOptions,
  { onlyActiveDiagram, diagramObjects }
) => {
  var toReturn = "";
  if (shouldGenerate(otherObject.id, { onlyActiveDiagram, diagramObjects })) {
    if (otherObject.type === "Enum") {
      toReturn += getGraphQlEnumStatement(otherObject, generatorOptions);
    } else if (otherObject.type === "Scalar") {
      toReturn += getGraphQlScalarStatement(otherObject, generatorOptions);
    } else if (otherObject.generate) {
      toReturn += getSimpleOtherObjectStatement(otherObject, generatorOptions);
    }
  }
  return toReturn;
};

/* tables */
export const getGraphQlDefineStatement = (
  table,
  quotations,
  tables,
  otherObjects,
  relations,
  indent,
  generatorOptions
) => {
  if (table !== null) {
    var code = "";

    if (table.generate === true || generatorOptions.previewObject === true) {
      if (table.objectType === "type") {
        table.beforeScript && (code += table.beforeScript + "\n");
        if (generatorOptions.previewObject === false) {
          table.desc && (code += '"""\n' + table.desc + '\n"""\n');
        }
        code +=
          "type " + table.name + getLinkedInterfaces(table, tables, relations);
        table.directive && (code += " " + table.directive);
        code += " {\n";

        //var tblCols = _.reject(table.cols, ["name", "ID"]);
        let tblCols = _.reject(table.cols, ["isHidden", true]);
        for (let col of tblCols) {
          col.comment && (code += '\n  """\n  ' + col.comment + '\n  """\n');
          code += "  " + _.lowerFirst(col.name);
          col.fieldArguments && (code += col.fieldArguments);
          code += ":";
          col.list && (code += "[");
          let tbl = _.find(tables, ["id", col.datatype]);
          let otherObj = _.find(otherObjects, ["id", col.datatype]);
          if (tbl) {
            code += tables[col.datatype].name;
          } else if (otherObj) {
            code += otherObjects[col.datatype].name;
          } else {
            code += col.datatype;
          }
          col.list && col.isArrayItemNn && (code += "!");
          col.list && (code += "]");
          col.nn ? (code += "!") : (code += "");
          col.fieldDirective && (code += " " + col.fieldDirective);
          code += "\n";
        }
        code += "}\n";
        table.afterScript && (code += table.afterScript + "\n");
      } else if (table.objectType === "input") {
        table.beforeScript && (code += table.beforeScript + "\n");
        if (generatorOptions.previewObject === false) {
          table.desc && (code += '"""\n' + table.desc + '\n"""\n');
        }
        code += "input " + table.name;
        table.directive && (code += " " + table.directive);
        code += " {\n";

        //var tblCols = _.reject(table.cols, ["name", "ID"]);
        let tblCols = _.reject(table.cols, ["isHidden", true]);
        for (let col of tblCols) {
          col.comment && (code += '\n  """\n  ' + col.comment + '\n  """\n');
          code += "  " + _.lowerFirst(col.name);
          col.fieldArguments && (code += col.fieldArguments);
          code += ":";
          col.list && (code += "[");
          let tbl = _.find(tables, ["id", col.datatype]);
          let otherObj = _.find(otherObjects, ["id", col.datatype]);
          if (tbl) {
            code += tables[col.datatype].name;
          } else if (otherObj) {
            code += otherObjects[col.datatype].name;
          } else {
            code += col.datatype;
          }
          col.list && col.isArrayItemNn && (code += "!");
          col.list && (code += "]");
          col.nn ? (code += "!") : (code += "");
          col.fieldDirective && (code += " " + col.fieldDirective);
          code += "\n";
        }
        code += "}\n";
        table.afterScript && (code += table.afterScript + "\n");
      } else if (table.objectType === "interface") {
        table.beforeScript && (code += table.beforeScript + "\n");
        if (generatorOptions.previewObject === false) {
          table.desc && (code += '"""\n' + table.desc + '\n"""\n');
        }
        code += "interface " + table.name;
        table.directive && (code += " " + table.directive);
        code += " {\n";

        //var tblCols = _.reject(table.cols, ["name", "ID"]);
        let tblCols = _.reject(table.cols, ["isHidden", true]);
        for (let col of tblCols) {
          col.comment && (code += '\n  """\n  ' + col.comment + '\n  """\n');
          code += "  " + _.lowerFirst(col.name);
          col.fieldArguments && (code += col.fieldArguments);
          code += ":";
          col.list && (code += "[");
          let tbl = _.find(tables, ["id", col.datatype]);
          let otherObj = _.find(otherObjects, ["id", col.datatype]);
          if (tbl) {
            code += tables[col.datatype].name;
          } else if (otherObj) {
            code += otherObjects[col.datatype].name;
          } else {
            code += col.datatype;
          }
          col.list && col.isArrayItemNn && (code += "!");
          col.list && (code += "]");
          col.nn ? (code += "!") : (code += "");
          col.fieldDirective && (code += " " + col.fieldDirective);
          code += "\n";
        }
        code += "}\n";
        table.afterScript && (code += table.afterScript + "\n");
      } else if (table.objectType === "union") {
        table.beforeScript && (code += table.beforeScript + "\n");
        if (generatorOptions.previewObject === false) {
          table.desc && (code += '"""\n' + table.desc + '\n"""\n');
        }
        code += "union " + table.name;
        table.directive && (code += " " + table.directive);
        code += " = ";
        let i = 0;
        //var tblCols = _.reject(table.cols, ["name", "ID"]);
        var tblCols = _.reject(table.cols, ["isHidden", true]);
        var cntCols = _.size(tblCols);

        for (let col of tblCols) {
          i++;
          let tbl = _.find(tables, ["id", col.datatype]);
          if (tbl) {
            code += tables[col.datatype].name;
          }
          if (i < cntCols) {
            code += " | ";
          }
        }
        code += "\n";
        table.afterScript && (code += table.afterScript + "\n\n");
      }
    }

    if (
      table.generateCustomCode === true &&
      generatorOptions.previewObject === false
    ) {
      table.customCode && (code += "\n\n" + table.customCode + "\n\n");
    }
    return code;
  }
};

export const getLinkedInterfaces = (table, tables, relations) => {
  var linkedInterfaces = [];
  var i = 0;
  var toReturn = "";
  for (var rel of table.relations) {
    let iteratedRelation = relations[rel];
    if (
      tables[iteratedRelation.parent] &&
      tables[iteratedRelation.parent].objectType === "interface" &&
      tables[iteratedRelation.child] &&
      tables[iteratedRelation.child].objectType === "type" &&
      iteratedRelation.type === "identifying"
    ) {
      linkedInterfaces = [...linkedInterfaces, iteratedRelation.parent];
    }
  }
  var cnt = _.size(linkedInterfaces);
  if (cnt > 0) {
    toReturn += " implements ";
    for (var linkedInterface of linkedInterfaces) {
      i++;
      toReturn += tables[linkedInterface].name;
      if (i < cnt) {
        toReturn += " & ";
      }
    }
  }
  return toReturn;
};

export function generateObjectComment(obj, generatorOptions) {
  if (
    (obj.generate === true && generatorOptions.previewObject === false) ||
    (obj.generateCustomCode === true &&
      generatorOptions.previewObject === false)
  ) {
    return obj.desc ? '"""\n' + obj.desc + ' \n"""\n' : "";
  }
  return "";
}

export function generateLinkObjectComment(
  otherObject,
  generate,
  generatorOptions
) {
  if (generate === true && generatorOptions.previewObject === false) {
    return otherObject.desc ? '"""\n' + otherObject.desc + ' \n"""\n' : "";
  }
  return "";
}

function getLinkCode(link, isLine) {
  if (isLine === true) {
    return link.generate && link.code ? link.code + "\n\n" : "";
  }
  return link.generateCustomCode && link.customCode
    ? link.customCode + "\n\n"
    : "";
}

export function getGraphQlLinkStatement(
  links,
  generatorOptions,
  { onlyActiveDiagram, diagramObjects },
  isLine
) {
  return _.map(
    _.filter(
      links,
      (link) =>
        shouldGenerate(link.id, { onlyActiveDiagram, diagramObjects }) &&
        generatorOptions.previewObject === false
    ),
    (link) =>
      `${generateLinkObjectComment(
        link,
        isLine === true ? link.generate : link.generateCustomCode,
        generatorOptions
      )}${getLinkCode(link, isLine)}`
  ).join("");
}
