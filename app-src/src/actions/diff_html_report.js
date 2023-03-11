import {
  ModelTypes,
  XControlProperty,
  XProperty,
  getInstancePathByXRefPath,
  getModelNode,
  getModelNodeProperty,
  getModelNodePropertyRelative,
  getReferencedObjectByXRefPath,
  getSubschema,
  pathToString
} from "common";

import { DeltaCalculator } from "../helpers/history/delta_calculator";
import { DiffHTMLReportCodeGenerator } from "./diff_html_report_code_generator";
import { DiffHTMLReportStats } from "./diff_html_report_stats";
import { Features } from "../helpers/features/features";
import HtmlTemplatesCompare from "../reports/html_templates_compare";
import _ from "lodash";
import { modernizeModel } from "./model";
import { toggleDiffHTMLReportModal } from "./ui";

function getModelToStore(state) {
  return {
    model: state.model,
    tables: state.tables,
    relations: state.relations,
    otherObjects: state.otherObjects
  };
}

export class ExtendModelMapper {
  constructor(
    { generatorStart, generatorFinish },
    { startModel, finishModel },
    options
  ) {
    this.generatorStart = generatorStart;
    this.generatorFinish = generatorFinish;
    this.startModel = startModel;
    this.finishModel = finishModel;
    this.modelType = startModel.model.type ?? finishModel.model.type;
    this.options = options;
  }

  extendModelIdArrayAttributes(modelNode, instancePath, { isStart, isFinish }) {
    return _.reduce(
      _.keys(modelNode),
      (r, propName) => {
        const innerId = modelNode[propName]["id"];
        const diff = this.extendModel(
          modelNode[propName],
          {
            instancePath: [...instancePath, propName],
            parentInstancePath: instancePath
          },
          { isStart, isFinish }
        );
        return {
          ...r,
          ...(!_.isEmpty(diff) ? { [innerId]: diff } : {})
        };
      },
      {}
    );
  }

  extendModelIdArray(modelNode, instancePath, { isStart, isFinish }) {
    const startOrder = _.map(modelNode, (key) => key["id"]);
    const finishOrder = _.map(modelNode, (key) => key["id"]);
    const attributes = this.extendModelIdArrayAttributes(
      modelNode,
      instancePath,
      { isStart, isFinish }
    );

    const subschema = getSubschema(pathToString(instancePath));

    const caption = subschema["x-caption"];
    const captionNode = caption ? { caption } : {};
    const description = subschema.description;
    const descriptionNode = description ? { description } : {};

    return _.isEmpty(attributes)
      ? {}
      : {
          ...captionNode,
          ...descriptionNode,
          diff: {
            idArray: true,
            ...(isStart ? { startOrder, finishOrder: [] } : {}),
            ...(isFinish ? { startOrder: [], finishOrder } : {})
          },
          attributes: this.extendModelIdArrayAttributes(
            modelNode,
            instancePath,
            { isStart, isFinish }
          )
        };
  }

  skipProperty(subschema) {
    const isHidden =
      subschema?.["x-hidden"]?.includes(Features.DIFF_HTML_REPORTS) ?? false;
    const isHiddenOnPlatform = !_.isEmpty(subschema?.["x-platforms"])
      ? !subschema?.["x-platforms"].includes(this.modelType)
      : false;
    const isSourceModuleDefined = !!subschema?.["x-source-module"];
    const isSubschemaDefined = !_.isEmpty(subschema);
    //console.dir({ isSourceModuleDefined });
    return (
      isHidden ||
      isHiddenOnPlatform ||
      isSourceModuleDefined ||
      !isSubschemaDefined
    );
  }

  extendModel(
    modelNode,
    { instancePath, parentInstancePath },
    { isStart, isFinish }
  ) {
    let result = undefined;
    //console.dir({ instancePath });
    if (!instancePath) {
    } else {
      const subschema = getSubschema(pathToString(instancePath));
      const parentSubschema = getSubschema(pathToString(parentInstancePath));

      if (this.skipProperty(subschema)) {
        result = {};
      } else {
        const caption = subschema["x-caption"];
        const captionNode = caption ? { caption } : {};

        const description = subschema["description"];
        const descriptionNode = description ? { description } : {};

        const isIdArray =
          _.isArray(modelNode) === true &&
          subschema?.[XControlProperty.X_TYPE] === XProperty.ARRAY_OBJECT;
        const isArray = _.isArray(modelNode) === true && !isIdArray;
        const itemCaptionNode = !!parentSubschema?.["x-item-caption"]
          ? { caption: parentSubschema["x-item-caption"] }
          : {};
        const isArrayNode = isArray === true ? { array: true } : {};
        const idRefNode =
          subschema?.["x-type"] === "id-ref"
            ? this.extendIdRef({}, pathToString(instancePath), {
                isStart,
                isFinish
              })
            : {};

        if (isIdArray === true) {
          result = this.extendModelIdArray(modelNode, instancePath, {
            isStart,
            isFinish
          });
        } else {
          //console.dir({ instancePath, modelNode });
          if (_.isObject(modelNode) === true) {
            const extendedModel = this.extendModelObject(
              modelNode,
              instancePath,
              { isStart, isFinish }
            );

            //console.dir({ extendedModel }, { depth: 10 });

            if (_.isEmpty(extendedModel)) {
              result = extendedModel;
            } else {
              const extendedModelWithDiff = {
                ...idRefNode,
                ...captionNode,
                ...descriptionNode,
                ...(isStart
                  ? { diff: { finishMissing: true, ...isArrayNode } }
                  : {}),
                ...(isFinish
                  ? { diff: { startMissing: true, ...isArrayNode } }
                  : {}),
                ...extendedModel
              };

              const shouldGenerateCode =
                subschema?.["x-sql-generation"]?.includes(this.modelType) ??
                false;
              let generatedNode = {};
              if (shouldGenerateCode === true) {
                const startCode =
                  isStart && !!this.generatorStart
                    ? this.generatorStart.generate(instancePath)
                    : undefined;
                const startCodeNode = startCode ? { startCode } : {};

                const finishCode =
                  isFinish && !!this.generatorFinish
                    ? this.generatorFinish.generate(instancePath)
                    : undefined;
                const finishCodeNode = finishCode ? { finishCode } : {};
                generatedNode =
                  !!startCode || !!finishCode
                    ? {
                        generated: { ...startCodeNode, ...finishCodeNode }
                      }
                    : {};
              }

              //console.dir({ shouldGenerateCode });

              result = {
                ...itemCaptionNode,
                ...generatedNode,
                ...extendedModelWithDiff
              };

              //console.dir({ r: result }, { depth: 10 });
            }
          } else {
            result = {
              ...idRefNode,
              ...captionNode,
              ...descriptionNode,
              ...itemCaptionNode,
              ...(isStart
                ? { startState: modelNode, finishMissing: true }
                : {}),
              ...(isFinish
                ? { startMissing: true, finishState: modelNode }
                : {})
            };
          }
        }
      }
    }
    return result;
  }

  extendIdRef(propDifference, innerInstancePathText, { isStart, isFinish }) {
    const startObjectUrl = getInstancePathByXRefPath(
      this.startModel,
      innerInstancePathText
    );

    const startStateCaption = startObjectUrl
      ? getModelNodeProperty(
          this.startModel,
          startObjectUrl,
          XProperty.NAME,
          true
        )
      : undefined;

    const startRefNode =
      isStart && !!startObjectUrl ? { startObjectUrl, startStateCaption } : {};

    const finishObjectUrl = getInstancePathByXRefPath(
      this.finishModel,
      innerInstancePathText
    );

    const finishStateCaption = finishObjectUrl
      ? getModelNodeProperty(
          this.finishModel,
          finishObjectUrl,
          XProperty.NAME,
          true
        )
      : undefined;

    const finishRefNode =
      isFinish && !!finishObjectUrl
        ? { finishObjectUrl, finishStateCaption }
        : {};

    return {
      ...propDifference,
      ...startRefNode,
      ...finishRefNode
    };
  }

  extendModelObjectAttributes(modelNode, instancePath, { isStart, isFinish }) {
    const subschema = getSubschema(pathToString(instancePath));
    const subschemaPropertyKeys = _.keys(subschema.properties);
    const modelNodePropertyKeys =
      _.size(subschemaPropertyKeys) > 0
        ? _.keys(modelNode).sort(
            (a, b) =>
              subschemaPropertyKeys.indexOf(a) -
              subschemaPropertyKeys.indexOf(b)
          )
        : _.keys(modelNode);
    return _.reduce(
      modelNodePropertyKeys,
      (r, propName) => {
        let result = undefined;
        const innerInstancePath = [...instancePath, propName];
        const innerInstancePathText = pathToString([...instancePath, propName]);

        const innerSubschema = getSubschema(innerInstancePathText);
        // console.log({
        //   instancePath,
        //   propName,
        //   subschema,
        //   innerSubschema,
        //   innerInstancePathText
        // });
        let propDifference = this.extendModel(
          modelNode[propName],
          { instancePath: innerInstancePath, parentInstancePath: instancePath },
          { isStart, isFinish }
        );

        if (innerSubschema?.["x-type"] === "id-ref") {
          propDifference = this.extendIdRef(
            propDifference,
            innerInstancePathText,
            { isStart, isFinish }
          );
        }

        if (
          innerSubschema?.["x-destruct"]?.includes(Features.DIFF_HTML_REPORTS)
        ) {
          result = {
            ...r,
            ...propDifference?.attributes
          };
        } else {
          const shouldGenerateCode =
            innerSubschema?.["x-sql-generation"]?.includes(this.modelType) ??
            false;
          let generated = {};
          if (shouldGenerateCode === true) {
            const startCode =
              isStart && !!this.generatorStart
                ? this.generatorStart.generate(innerInstancePath)
                : undefined;
            const startCodeNode = startCode ? { startCode } : {};

            const finishCode =
              isFinish && !!this.generatorFinish
                ? this.generatorFinish.generate(innerInstancePath)
                : undefined;
            const finishCodeNode = finishCode ? { finishCode } : {};

            generated =
              !!startCode || !!finishCode
                ? {
                    generated: { ...startCodeNode, ...finishCodeNode }
                  }
                : {};
          } else {
            generated = {};
          }

          const propDifferenceNode = !_.isEmpty(propDifference)
            ? { [propName]: { ...generated, ...propDifference } }
            : {};

          result = {
            ...r,
            ...propDifferenceNode
          };
        }
        //console.dir({ result });
        return result;
      },
      {}
    );
  }

  extendModelObject(modelNode, instancePath, { isStart, isFinish }) {
    const caption = getModelNodePropertyRelative(
      modelNode,
      pathToString(instancePath),
      XProperty.NAME
    );
    const captionNode = caption ? { caption, objectCaption: true } : {};
    const description = getModelNodePropertyRelative(
      modelNode,
      pathToString(instancePath),
      XProperty.DESC
    );
    const descriptionNode = description ? { description } : {};

    const attributes = this.extendModelObjectAttributes(
      modelNode,
      instancePath,
      { isStart, isFinish }
    );

    return !_.isEmpty(attributes)
      ? {
          ...captionNode,
          ...descriptionNode,
          attributes
        }
      : {};
  }

  extendStartModel(startState, instancePath, parentInstancePath) {
    const extendedStartModel = this.extendModel(
      startState,
      {
        instancePath,
        parentInstancePath
      },
      { isStart: true, isFinish: false }
    );
    return {
      ...(!_.isEmpty(extendedStartModel) ? extendedStartModel : {})
    };
  }

  extendFinishModel(finishState, instancePath, parentInstancePath) {
    const extendedFinishModel = this.extendModel(
      finishState,
      {
        instancePath,
        parentInstancePath
      },
      { isStart: false, isFinish: true }
    );
    return {
      ...(!_.isEmpty(extendedFinishModel) ? extendedFinishModel : {})
    };
  }
}

export class ExtendDifferenceMapperFactory {
  static createMapper({ startModel, finishModel }, options) {
    const generatorStart = new DiffHTMLReportCodeGenerator(startModel);
    const generatorFinish = new DiffHTMLReportCodeGenerator(finishModel);

    const extendModelMapper = new ExtendModelMapper(
      { generatorStart, generatorFinish },
      { startModel, finishModel },
      options
    );

    return new ExtendDifferenceMapper(
      extendModelMapper,
      { generatorStart, generatorFinish },
      { startModel, finishModel },
      options
    );
  }
}

export class ExtendDifferenceMapper {
  constructor(
    extendModelMapper,
    { generatorStart, generatorFinish },
    { startModel, finishModel },
    options
  ) {
    this.extendModelMapper = extendModelMapper;
    this.startModel = startModel;
    this.finishModel = finishModel;
    this.modelType = this.startModel.model.type ?? this.finishModel.model.type;
    this.options = options;
    this.generatorStart = generatorStart;
    this.generatorFinish = generatorFinish;
  }

  removeUnused(difference) {
    let result = undefined;
    if (!difference) {
      result = undefined;
    } else {
      const childrenDifferences =
        difference.attributes &&
        _.reduce(
          _.keys(difference.attributes),
          (r, key) => {
            const node = difference.attributes[key];
            const attributes = this.removeUnused(node);

            if (attributes === undefined) {
              return r;
            }
            return {
              ...r,
              [key]: { ...attributes }
            };
          },
          {}
        );
      const childrenDifferencesNode =
        _.size(childrenDifferences) > 0
          ? { attributes: childrenDifferences }
          : undefined;

      if (!!childrenDifferencesNode) {
        result = { ...difference, ...childrenDifferencesNode };
      } else if (!!difference.generated) {
        result = _.omit(difference, ["attributes"]);
      }
    }

    return result;
  }

  extend() {
    const differences = new DeltaCalculator(
      this.startModel,
      this.finishModel
    ).calculate();
    let extendedDiff = this.extendDiff(
      differences,
      { instancePathStart: [], instancePathParentStart: undefined },
      { instancePathFinish: [], instancePathParentFinish: undefined }
    );

    const stats = new DiffHTMLReportStats({
      startModel: this.startModel,
      finishModel: this.finishModel
    });

    extendedDiff = stats.addStatistics(extendedDiff);

    return this.options?.generateSQL === true
      ? this.removeUnused(extendedDiff)
      : extendedDiff;
  }

  getInnerStartPath(instancePathStart, difference, attributeKey) {
    const startOrderIndex = _.indexOf(
      difference.startOrder ?? difference.order,
      attributeKey
    );
    const innerStartKey =
      difference.isIdArray === true
        ? startOrderIndex >= 0
          ? startOrderIndex.toString()
          : undefined
        : attributeKey;

    return innerStartKey ? [...instancePathStart, innerStartKey] : undefined;
  }

  getInnerFinishPath(instancePathFinish, difference, attributeKey) {
    const finishOrderIndex = _.indexOf(
      difference.finishOrder ?? difference.order,
      attributeKey
    );

    const innerFinishKey =
      difference.isIdArray === true
        ? finishOrderIndex >= 0
          ? finishOrderIndex.toString()
          : undefined
        : attributeKey;
    return innerFinishKey ? [...instancePathFinish, innerFinishKey] : undefined;
  }

  extendDiffAttributeSQLGeneration(
    subschema,
    { innerStartPath, innerFinishPath }
  ) {
    let result = undefined;
    const shouldGenerateCode = subschema?.["x-sql-generation"]?.includes(
      this.modelType
    );

    // console.dir(
    //   {
    //     extendDiffAttributeSQLGeneration: {
    //       innerStartPath,
    //       innerFinishPath,
    //       shouldGenerateCode,
    //       subschema
    //     }
    //   },
    //   { depth: 3 }
    // );

    if (shouldGenerateCode === true) {
      const startCode =
        innerStartPath && !!this.generatorStart
          ? this.generatorStart.generate(innerStartPath)
          : undefined;
      const startCodeNode = startCode ? { startCode } : {};

      const finishCode =
        innerFinishPath && !!this.generatorFinish
          ? this.generatorFinish.generate(innerFinishPath)
          : undefined;
      const finishCodeNode = finishCode ? { finishCode } : {};

      result =
        shouldGenerateCode && (!!startCode || !!finishCode)
          ? {
              generated: { ...startCodeNode, ...finishCodeNode }
            }
          : {};
      // console.dir({ xax: result });
      return result;
    }
    return undefined;
  }

  extendDiffAtributeMapByProperty(
    subschema,
    extendedChildrenResult,
    resultWithDiffAndGenerated,
    { innerStartPath, innerFinishPath }
  ) {
    let typeIdMapping = undefined;
    // console.dir(
    //   {
    //     extendDiffAtributeMapByProperty: {
    //       extendedChildrenResult,
    //       resultWithDiffAndGenerated
    //     }
    //   },
    //   { depth: 5 }
    // );
    const mapByProperty = subschema?.["x-map-by-property"];
    typeIdMapping = _.reduce(
      _.keys(extendedChildrenResult.attributes),
      (r, id) => {
        const startObj = getModelNode(
          this.startModel,
          pathToString([...innerStartPath, id])
        );
        const finishObj = getModelNode(
          this.finishModel,
          pathToString([...innerFinishPath, id])
        );
        // console.dir(
        //   {
        //     mapByProperty,
        //     startObjId: startObj?.id,
        //     finishObjId: finishObj?.id,
        //     startObjProperty: startObj?.[mapByProperty.property],
        //     finishObjProperty: finishObj?.[mapByProperty.property],
        //     nevim: _.lowerFirst(
        //       startObj?.[mapByProperty.property] ??
        //         finishObj?.[mapByProperty.property] ??
        //         ""
        //     )
        //   },
        //   { depth: 3 }
        // );

        let mapPropertyNode = {};

        if (!!startObj?.id) {
          const mapProperty = startObj[mapByProperty.property];
          if (!!mapProperty) {
            mapPropertyNode = { [startObj.id]: _.lowerFirst(mapProperty) };
          } else {
            mapPropertyNode = {
              [startObj.id]: mapByProperty.schemas.undefined?.["default"]
            };
          }
        } else if (!!finishObj?.id) {
          const mapProperty = finishObj[mapByProperty.property];
          if (!!mapProperty) {
            mapPropertyNode = { [finishObj.id]: _.lowerFirst(mapProperty) };
          } else {
            mapPropertyNode = {
              [finishObj.id]: mapByProperty.schemas.undefined?.["default"]
            };
          }
        }

        return {
          ...r,
          ...mapPropertyNode
        };
      },
      {}
    );

    // console.log({ typeIdMapping });

    const extendedDiffMappedInfoNode = _.reduce(
      _.keys(resultWithDiffAndGenerated.attributes),
      (r, item) => {
        const mappedSchema =
          mapByProperty?.schemas?.[typeIdMapping[item]] ?? {};
        const mappedSchemaNoControlKeys = _.omit(mappedSchema, ["new-key"]);
        const newKey = mappedSchema["new-key"] ?? typeIdMapping[item];
        // console.log({
        //   newKey,
        //   item,
        //   mappedSchemaNoControlKeys,
        //   mapByProperty
        // });
        const x = {
          ...r,
          [newKey]: {
            ...mappedSchemaNoControlKeys,
            ...r[newKey],
            attributes: {
              ...r?.[newKey]?.attributes,
              [item]: {
                ...resultWithDiffAndGenerated.attributes[item]
              }
            }
          }
        };
        //        console.dir({ y: x });
        return x;
      },
      {}
    );

    // console.dir(
    //   {
    //     s: mapByProperty?.schemas,
    //     k: _.map(_.keys(extendedDiffMappedInfoNode), (k1) => {
    //       console.log(mapByProperty?.schemas);
    //       return {
    //         s: mapByProperty?.schemas,
    //         k1,
    //         x: _.findIndex(_.map(mapByProperty?.schemas), (x) => {
    //           return x["new-key"] === k1;
    //         }),
    //         kys: _.map(mapByProperty?.schemas, (s) => ({
    //           key: s["new-key"] === k1
    //         }))
    //       };
    //     })
    //   },
    //   { depth: 10 }
    // );

    const orderedSchemaKeys = _.uniq(
      _.map(mapByProperty?.schemas, (x) => x["new-key"])
    );

    // const a =_.keys(extendedDiffMappedInfoNode);
    // console.log(a);
    // const b = _.sortBy(a, (a,b) => {
    //   return
    // })

    const extendedDiffMappedInfoNodeOrdered = _.reduce(
      _.sortBy(_.keys(extendedDiffMappedInfoNode), (start, finish) => {
        return (
          orderedSchemaKeys.indexOf(start) - orderedSchemaKeys.indexOf(finish)
        );
      }),
      (r, i) => {
        return {
          ...r,
          [i]: extendedDiffMappedInfoNode[i]
        };
      },
      {}
    );

    // console.log({ s: extendedDiffMappedInfoNodeOrdered });

    return extendedDiffMappedInfoNodeOrdered;
  }

  extendDiffAttributes(difference, instancePathStart, instancePathFinish) {
    const startSubschema = getSubschema(pathToString(instancePathStart));
    const finishSubschema = getSubschema(pathToString(instancePathFinish));
    const subschemaKeys =
      _.keys(startSubschema?.properties) ??
      _.keys(finishSubschema?.properties) ??
      [];
    const orderedKeys =
      _.size(subschemaKeys) > 0
        ? _.keys(difference.attributes).sort(
            (a, b) => subschemaKeys.indexOf(a) - subschemaKeys.indexOf(b)
          )
        : _.keys(difference.attributes);
    return _.reduce(
      orderedKeys,
      (r, attributeKey) => {
        let result = undefined;
        const innerStartPath = this.getInnerStartPath(
          instancePathStart,
          difference,
          attributeKey
        );
        const innerFinishPath = this.getInnerFinishPath(
          instancePathFinish,
          difference,
          attributeKey
        );

        const extendedChildrenResult = this.extendDiff(
          difference.attributes[attributeKey],
          {
            instancePathStart: innerStartPath,
            instancePathParentStart: instancePathStart
          },
          {
            instancePathFinish: innerFinishPath,
            instancePathParentFinish: instancePathFinish
          }
        );

        //console.dir({ extendedChildrenResult }, { depth: 10 });

        const subschema =
          (innerStartPath && getSubschema(pathToString(innerStartPath))) ??
          (innerFinishPath && getSubschema(pathToString(innerFinishPath)));

        const resultWithDiffAndGenerated = {
          ...(innerStartPath ? {} : { diff: { startMissing: true } }),
          ...(innerFinishPath ? {} : { diff: { finishMissing: true } }),
          ...extendedChildrenResult
        };

        //console.dir({ resultWithDiffAndGenerated }, { depth: 10 });
        const shouldDestruct = subschema?.["x-destruct"]?.includes(
          Features.DIFF_HTML_REPORTS
        );

        const extendedDiffWithMissingInfoNode = !shouldDestruct
          ? !_.isEmpty(resultWithDiffAndGenerated) ||
            resultWithDiffAndGenerated.attributes === undefined
            ? { [attributeKey]: resultWithDiffAndGenerated }
            : {}
          : resultWithDiffAndGenerated.attributes;

        const shouldSkipProperty =
          (subschema?.["x-hidden"]?.includes(Features.DIFF_HTML_REPORTS) ||
            !!subschema?.["x-source-module"]) ??
          false;
        // console.dir({ shouldSkipProperty, r });
        if (shouldSkipProperty || _.isEmpty(extendedChildrenResult)) {
          result = r;
        } else {
          if (!!subschema?.["x-map-by-property"]) {
            // console.dir({
            //   ["x-map-by-property"]: {
            //     subschema,
            //     extendedChildrenResult,
            //     resultWithDiffAndGenerated,
            //     x: { innerStartPath, innerFinishPath }
            //   }
            // });
            result = {
              ...r,
              ...this.extendDiffAtributeMapByProperty(
                subschema,
                extendedChildrenResult,
                resultWithDiffAndGenerated,
                { innerStartPath, innerFinishPath }
              )
            };
          } else {
            result = {
              ...r,
              ...extendedDiffWithMissingInfoNode
            };
          }
        }

        return result;
      },
      {}
    );
  }

  extendDiff(
    difference,
    { instancePathStart, instancePathParentStart },
    { instancePathFinish, instancePathParentFinish }
  ) {
    //console.dir({ difference, instancePathStart, instancePathFinish });
    const subschema =
      (instancePathStart && getSubschema(pathToString(instancePathStart))) ??
      (instancePathFinish && getSubschema(pathToString(instancePathFinish)));

    if (!subschema) {
      return {};
    }
    const parentSubschema =
      (instancePathParentStart &&
        getSubschema(pathToString(instancePathParentStart))) ??
      (instancePathParentFinish &&
        getSubschema(pathToString(instancePathParentFinish)));

    const noObjectIfEmptyProps = subschema?.["x-no-object-if-empty"];
    const startObjectCounter =
      !!noObjectIfEmptyProps &&
      !!instancePathStart &&
      _.reduce(
        noObjectIfEmptyProps,
        (r, item) => {
          return !_.isEmpty(
            getModelNode(
              this.startModel,
              pathToString([...instancePathStart, item])
            )
          )
            ? r + 1
            : r;
        },
        0
      );
    const finishObjectCounter =
      !!noObjectIfEmptyProps &&
      !!instancePathFinish &&
      _.reduce(
        noObjectIfEmptyProps,
        (r, item) => {
          return !_.isEmpty(
            getModelNode(
              this.finishModel,
              pathToString([...instancePathFinish, item])
            )
          )
            ? r + 1
            : r;
        },
        0
      );

    const hasStartNoObject = !!noObjectIfEmptyProps && startObjectCounter === 0;
    const hasFinishNoObject =
      !!noObjectIfEmptyProps && finishObjectCounter === 0;
    // console.dir({
    //   hasStartNoObject,
    //   hasFinishNoObject,
    //   difference,
    //   instancePathStart
    // });
    if (difference.finishMissing === true || hasFinishNoObject === true) {
      return this.extendModelMapper.extendStartModel(
        difference.finishMissing
          ? difference.startState
          : instancePathStart
          ? getModelNode(this.startModel, pathToString(instancePathStart))
          : {},
        instancePathStart,
        instancePathParentStart
      );
    }

    if (difference.startMissing === true || hasStartNoObject === true) {
      return this.extendModelMapper.extendFinishModel(
        difference.startMissing
          ? difference.finishState
          : instancePathFinish
          ? getModelNode(this.finishModel, pathToString(instancePathFinish))
          : {},
        instancePathFinish,
        instancePathParentFinish
      );
    }

    const isIdRef = subschema?.["x-type"] === "id-ref" ?? false;

    const startObjectUrl =
      isIdRef && difference.startState !== undefined
        ? getInstancePathByXRefPath(
            this.startModel,
            pathToString(instancePathStart)
          )
        : undefined;

    const startStateCaption = startObjectUrl
      ? getModelNodeProperty(
          this.startModel,
          startObjectUrl,
          XProperty.NAME,
          true
        )
      : undefined;

    const startRefNode =
      isIdRef && !!startObjectUrl ? { startObjectUrl, startStateCaption } : {};

    const finishObjectUrl =
      isIdRef && difference.finishState !== undefined
        ? getInstancePathByXRefPath(
            this.finishModel,
            pathToString(instancePathFinish)
          )
        : undefined;

    const finishStateCaption = finishObjectUrl
      ? getModelNodeProperty(
          this.finishModel,
          finishObjectUrl,
          XProperty.NAME,
          true
        )
      : undefined;

    const finishRefNode =
      isIdRef && !!finishObjectUrl
        ? { finishObjectUrl, finishStateCaption }
        : {};

    const startStateNode =
      difference.startState !== undefined
        ? { startState: difference.startState, ...startRefNode }
        : {};
    const finishStateNode =
      difference.finishState !== undefined
        ? { finishState: difference.finishState, ...finishRefNode }
        : {};

    //console.dir({ startStateNode, finishStateNode }, { depth: 10 });

    const arrayNode = difference.isArray ? { diff: { array: true } } : {};

    const idArrayNode = this.getIdArrayNode(difference, {
      instancePathStart,
      instancePathFinish
    });

    const generatedNode = this.extendDiffAttributeSQLGeneration(subschema, {
      innerStartPath: instancePathStart,
      innerFinishPath: instancePathFinish
    });

    const attributesNode = {
      ...(difference.attributes
        ? {
            attributes: this.extendDiffAttributes(
              difference,
              instancePathStart,
              instancePathFinish
            )
          }
        : {}),
      ...generatedNode
    };

    //    console.dir({ attributesNode });

    const notEmptyAttributesNode =
      _.isEmpty(attributesNode.attributes) &&
      _.isEmpty(attributesNode.generated)
        ? {}
        : attributesNode;

    //console.dir({ notEmptyAttributesNode, instancePathStart }, { depth: 10 });

    const captionNode = this.getDiffCaption(subschema, {
      instancePathStart,
      instancePathFinish
    });

    // console.dir({
    //   captionNode,
    //   instancePathStart,
    //   instancePathFinish,
    //   subschema,
    //   start: this.startModel
    // });

    const description = subschema["description"];
    const descriptionNode = description ? { description } : {};

    const itemCaptionNode = !!parentSubschema?.["x-item-caption"]
      ? { caption: parentSubschema["x-item-caption"] }
      : {};

    const r1 = {
      ...itemCaptionNode,
      ...descriptionNode,
      ...startStateNode,
      ...finishStateNode,
      ...arrayNode,
      ...idArrayNode,
      ...notEmptyAttributesNode
    };

    const result = _.isEmpty(r1)
      ? r1
      : {
          ...captionNode,
          ...r1
        };

    return result;
  }

  hideNode(model, instancePath) {
    let result = false;
    const instancePathText = pathToString(instancePath);
    const subschema = getSubschema(instancePathText);
    if (!!subschema?.["x-no-object-if-empty"]) {
      const modelNode = getModelNode(model, instancePathText);
      const count = _.reduce(
        subschema?.["x-no-object-if-empty"],
        (r, i) => {
          return !_.isEmpty(modelNode[i]) ? r + 1 : r;
        },
        0
      );
      if (count === 0) {
        result = true;
      }
    }
    return result;
  }

  getIdArrayNode(difference, { instancePathStart, instancePathFinish }) {
    let resultNode = {};
    if (difference.order) {
      const orderStartFiltered = difference.order?.filter(
        (i, index) =>
          !this.hideNode(this.startModel, [...instancePathStart, index])
      );
      const orderFinishFiltered = difference.order?.filter(
        (i, index) =>
          !this.hideNode(this.finishModel, [...instancePathFinish, index])
      );
      if (
        !_.isEqual(orderStartFiltered, difference.order) ||
        !_.isEqual(orderFinishFiltered, difference.order)
      ) {
        resultNode = {
          startOrder: orderStartFiltered,
          finishOrder: orderFinishFiltered
        };
      } else {
        resultNode = {
          order: difference.order
        };
      }
    } else {
      const orderStartFilteredForStart = difference.startOrder?.filter(
        (i, index) =>
          !this.hideNode(this.startModel, [...instancePathStart, index])
      );
      const orderFinishFilteredForFinish = difference.finishOrder?.filter(
        (i, index) =>
          !this.hideNode(this.finishModel, [...instancePathFinish, index])
      );
      resultNode = {
        startOrder: orderStartFilteredForStart,
        finishOrder: orderFinishFilteredForFinish
      };
    }

    return difference.isIdArray
      ? {
          diff: {
            idArray: true,
            ...resultNode
          }
        }
      : {};
  }

  getDiffCaption(subschema, { instancePathStart, instancePathFinish }) {
    const caption = subschema["x-caption"];
    if (caption) {
      return { caption };
    }

    const instancePathStartText = pathToString(instancePathStart);
    const startObjectCaption = getModelNodePropertyRelative(
      getModelNode(this.startModel, instancePathStartText),
      instancePathStartText,
      XProperty.NAME
    );
    if (startObjectCaption) {
      return { caption: startObjectCaption, objectCaption: true };
    }

    const instancePathFinishText = pathToString(instancePathFinish);
    const finishObjectCaption = getModelNodePropertyRelative(
      getModelNode(this.finishModel, instancePathFinishText),
      instancePathFinishText,
      XProperty.NAME
    );
    if (finishObjectCaption) {
      return { caption: finishObjectCaption, objectCaption: true };
    }
    return {};
  }
}

export const generateDiffHTMLReport = (
  ipcRenderer,
  style,
  generateSQL,
  reportDescription,
  authorInfo,
  timestamp
) => {
  return async (dispatch, getState) => {
    const state = getState();
    const output = JSON.stringify(state.reverseStats.diffReport, null, 2);

    ipcRenderer?.send("app:exportToDiffHtml", {
      reportContent: HtmlTemplatesCompare.htmlStart(
        "Report",
        output,
        reportDescription,
        JSON.stringify(authorInfo),
        timestamp
      ),
      reportStyleName: style,
      source: state.reverseStats.currentModel,
      target: state.reverseStats.updatedModel
    });

    await dispatch(toggleDiffHTMLReportModal());
  };
};

export const getReportDiff = (newModel, originalModel) => {
  const currentModel = getModelToStore(modernizeModel(originalModel));
  const updatedModel = getModelToStore(modernizeModel(newModel));

  const extendDifferenceMapper = ExtendDifferenceMapperFactory.createMapper(
    { startModel: currentModel, finishModel: updatedModel },
    { generateSQL: false }
  );
  return {
    diffReport: extendDifferenceMapper.extend(),
    currentModel,
    updatedModel
  };
};
