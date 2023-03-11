import _ from "lodash";

/* tables */
export const getSequelizeDefineStatement = (
  table,
  quotations,
  generatorOptions
) => {
  var q = quotations;
  if (table !== null) {
    var code = "";

    if (table.generate === true || generatorOptions.previewObject === true) {
      table.beforeScript && (code += table.beforeScript + "\n\n");
      code += "const ";
      code +=
        _.upperFirst(table.name) +
        " = sequelize" +
        ".define(" +
        q +
        table.name +
        q +
        ", { \n";
      var i = 0;
      for (var col of table.cols) {
        //table.cols.map(col => {
        i++;
        code += "   " + col.name + ": {\n      type: Sequelize." + col.datatype;
        col.zerofill && (code += ".ZEROFILL");
        col.unsigned && (code += ".UNSIGNED");
        col.binary && (code += ".BINARY");

        if (col.datatype === "RANGE") {
          code += col.enumrange;
        } else if (col.datatype === "ENUM") {
          code += col.enumrange;
        } else {
          if (col.param) {
            code += "(" + col.param + ")";
          }
        }

        col.pk === true && (code += ", \n      primaryKey:true");
        col.nn === true && (code += ", \n      allowNull:false");
        if (col.uniqueName && col.uniqueName !== undefined) {
          code += ", \n      unique:" + q + col.uniqueName + q;
        } else {
          if (col.unique === true) {
            code += ", \n      unique:true";
          }
        }

        col.defaultvalue &&
          (code += ",\n      defaultValue: " + col.defaultvalue);

        col.validation && (code += ",\n      validation: " + col.validation);

        col.autoinc && (code += ",\n      autoIncrement: true");

        col.comment && (code += ", \n      comment: " + q + col.comment + q);
        code += "\n   }";
        if (_.size(table.cols) !== i) code += ", \n";
        //})
      }

      code += "\n}, { ";

      code += "\n  timestamps: " + table.timestamps;

      if (table.paranoid === true) {
        code += ",\n  paranoid: " + table.paranoid;
      }

      if (table.freezeTableName === true) {
        code += ",\n  freezeTableName: " + table.freezeTableName;
        //code += ",\n  tableName: " + q + table.name + q;
      }

      if (table.underscored && table.underscored === true) {
        code += ",\n  underscored: " + table.underscored;
      }

      if (table.version === true) {
        code += ",\n  version: " + table.version;
      }

      if (table.singular !== "na" && table.singular !== undefined) {
        code += ",\n  singular: " + q + table.singular + q;
      }

      if (table.plural !== "na" && table.plural !== undefined) {
        code += ",\n  plural: " + q + table.plural + q;
      }

      if (table.tablename !== "na" && table.tablename !== undefined) {
        code += ",\n  tableName: " + q + table.tablename + q;
      }

      if (table.tabletype !== "na" && table.tabletype !== undefined) {
        code += ",\n  engine: " + q + table.tabletype + q;
      }

      if (table.collation && table.collation !== undefined) {
        code += ",\n collate: " + q + table.collation + q;
      }

      if (table.charset && table.charset !== undefined) {
        code += ",\n charset: " + q + table.charset + q;
      }

      if (table.desc && table.desc !== undefined) {
        code += ",\n comment: " + q + table.desc + q;
      }

      if (table.initautoinc && table.desc !== undefined) {
        code += ",\n initialAutoIncrement: " + table.initautoinc;
      }

      if (_.size(table.indexes) > 0) {
        code += getIndexSequelize(table, q);
      }
      code += "\n }";

      code += "\n);\n\n";

      table.afterScript && (code += table.afterScript + "\n\n");
    }
  }
  return code;
};

export const getColumnName = (tablecols, col_id) => {
  var toReturn = _.find(tablecols, ["id", col_id]);

  if (toReturn !== null || toReturn !== undefined) {
    return toReturn.name;
  }
};

export const getIndexSequelize = (table, q) => {
  var code = "";
  if (table !== null) {
    var e = 0;
    if (_.size(table.indexes) > 0) {
      code += ", \n  indexes: [\n";

      for (var tableIndex of table.indexes) {
        e++;
        code += "  {\n";
        tableIndex.unique && (code += "   unique: true, \n");
        tableIndex.fulltext &&
          (code += "   type: " + q + "fulltext" + q + "\n");
        code += "   name: " + q + tableIndex.name + q;
        tableIndex.using !== "na" &&
          tableIndex.using !== undefined &&
          (code += ", \n   method: " + q + tableIndex.using + q);

        code += ",\n   fields: [";
        var a = 0;
        for (var indexCol of tableIndex.cols) {
          a++;

          indexCol.colid !== "0" &&
            (code += q + getColumnName(table.cols, indexCol.colid) + q);

          if (_.size(tableIndex.cols) !== a) code += ", ";
        }
        code += "]\n  }";

        code += "";

        if (_.size(table.indexes) !== e) code += ",\n";
      }
      code += "\n  ]";
    }
  }
  return code;
};

/* relations */
export const getSequelizeAssociation = (
  relation,
  cht,
  pt,
  quotations,
  direction,
  generatorOptions
) => {
  var k = _.find(pt.keys, ["id", relation.parent_key]);
  var q = quotations;
  var code = "";

  if (direction === "belongs" || direction === "both") {
    if (relation.orm_association_belongs !== "na") {
      if (
        relation.generate === true ||
        generatorOptions.previewObject === true
      ) {
        // child - BELONGS TO
        code +=
          "" +
          _.upperFirst(cht.name) +
          "." +
          relation.orm_association_belongs +
          "(" +
          _.upperFirst(pt.name) +
          ", {\n";

        relation.orm_alias_belongs !== "" &&
          relation.orm_alias_belongs !== undefined &&
          (code += "as: " + q + relation.orm_alias_belongs + q + ", ");

        code += " foreignKey: ";
        var i = 0;
        var pl = "";
        var chl = "";
        for (var col of relation.cols) {
          var chtc = _.find(cht.cols, ["id", col.childcol]);
          var ptc = _.find(pt.cols, ["id", col.parentcol]);
          i++;
          chl += "" + q + chtc.name + q;
          pl += "" + q + ptc.name + q;
          if (_.size(relation.cols) !== i) {
            chl += ", \n";
            pl += ", \n";
          }
        }

        code += chl;
        if (k.isPk) {
          code += ",\n target: ";
        } else {
          code += ",\n targetKey: ";
        }
        code += pl;
        if (relation.orm_through_belongs) {
          code += ", through: " + relation.orm_through_belongs + "";
        }
        if (relation.orm_constraints_belongs === true) {
          code += ", constraints: false";
        }
        code += "\n});\n\n";
      }
      code += generateRelationCustomCode(relation, generatorOptions);
    }
  }

  if (direction === "has" || direction === "both") {
    if (relation.orm_association_has !== "na") {
      if (
        relation.generate === true ||
        generatorOptions.previewObject === true
      ) {
        // child - HAS
        code +=
          "\n" +
          _.upperFirst(pt.name) +
          "." +
          relation.orm_association_has +
          "(" +
          _.upperFirst(cht.name) +
          ", {\n";

        relation.orm_alias_has !== "" &&
          relation.orm_alias_has !== undefined &&
          (code += "as: " + q + relation.orm_alias_has + q + ", ");
        code += " foreignKey: ";
        var i2 = 0;
        var pl2 = "";
        var chl2 = "";
        for (var col2 of relation.cols) {
          var chtc2 = _.find(cht.cols, ["id", col2.childcol]);
          var ptc2 = _.find(pt.cols, ["id", col2.parentcol]);
          i2++;
          chl2 += "" + q + chtc2.name + q;
          pl2 += "" + q + ptc2.name + q;
          if (_.size(relation.cols) !== i2) {
            chl2 += ", \n";
            pl2 += ", \n";
          }
        }

        code += chl2;
        if (k.isPk) {
          code += ",\n target: ";
        } else {
          code += ",\n sourceKey: ";
        }
        code += pl2;
        if (relation.orm_through_has) {
          code += ", through: " + relation.orm_through_has + "";
        }
        if (relation.orm_constraints_has === true) {
          code += ", constraints: false";
        }
        code += "\n});\n\n";
      }
      code += generateRelationCustomCode(relation, generatorOptions);
    }
  }

  return code;
};
function generateRelationCustomCode(relation, generatorOptions) {
  let code = "";
  if (
    relation.generateCustomCode === true &&
    generatorOptions.previewObject === false
  ) {
    relation.customCode && (code += relation.customCode + "\n\n");
  }
  return code;
}
