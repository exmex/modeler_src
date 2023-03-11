import { ModelTypes } from "../../enums/enums";
import MongoDbHelpers from "../../platforms/mongodb/helpers_mongodb";
import React from "react";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";

const ConversionHelpers = {

    convertToMongoose(model) {
        let modelToReturn = _.cloneDeep(model);
        modelToReturn.model.id = uuidv4();
        _.map(modelToReturn.tables, async (table) => {
          table.indexes = [];
      
          _.map(table.cols, async (col) => {
            col.validation = "";
            col.datatype = MongoDbHelpers.convertMongoDBDataTypesToMongoose(
              col.datatype
            );
          });
        });
        _.map(modelToReturn.otherObjects, async (other) => {
          other.type = "Other";
        });
        modelToReturn.model.filePath = "";
        modelToReturn.model.type = ModelTypes.MONGOOSE;
        return modelToReturn;
      }

};
export default ConversionHelpers;
