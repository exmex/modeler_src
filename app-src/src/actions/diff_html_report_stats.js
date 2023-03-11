import {
  ModelTypes,
  XProperty,
  getMappedModelNode,
  getModelNodeProperty,
  getReferencedObjectByXRefPath,
  pathToString
} from "common";

import _ from "lodash";

export class DiffHTMLReportStats {
  constructor({ startModel, finishModel }) {
    this.startModel = startModel;
    this.finishModel = finishModel;
    this.modelType = startModel.model.type ?? finishModel.model.type;
  }

  //jsou tu 2 struktury
  // diff
  // model
  // diff je pro modified/added/removed
  // normalni model v cili je total
  // bez ohledu na to co je v diff musim pro total projit target model

  //jdes ve strukture reportu a tam jsou jine nazvy jinak filtrovane objekty je treba si ten seznam pripravit
  //ale ted bude asi stacit jen to co pocita final

  initDiffCounter() {
    return {
      added: { count: 0, idNames: [] },
      removed: { count: 0, idNames: [] },
      modified: { count: 0, idNames: [] }
    };
  }

  crawlAsteriskDiffNode(result, diffNode, restDiffPath, finishInstancePath) {
    const nextDiffNode = diffNode?.attributes;
    if (!!nextDiffNode) {
      const keys = _.keys(diffNode.attributes);
      result = _.reduce(
        keys,
        (count, key) => {
          const res = this.crawlNodes(nextDiffNode[key], restDiffPath, [
            ...finishInstancePath,
            key
          ]);

          const startName = getModelNodeProperty(
            this.startModel,
            pathToString([...finishInstancePath, key]),
            XProperty.NAME,
            true
          );
          const finishName = getModelNodeProperty(
            this.finishModel,
            pathToString([...finishInstancePath, key]),
            XProperty.NAME,
            true
          );

          const name = startName ?? finishName;

          return {
            added: {
              count: res.added.count + count.added.count,
              idNames: [
                ...count.added.idNames,
                ..._.map(res.added.idNames, (idName) => ({
                  ...idName,
                  name: [name, idName.name].join(".")
                }))
              ]
            },
            removed: {
              count: res.removed.count + count.removed.count,
              idNames: [
                ...count.removed.idNames,
                ..._.map(res.removed.idNames, (idName) => ({
                  ...idName,
                  name: [name, idName.name].join(".")
                }))
              ]
            },
            modified: {
              count: res.modified.count + count.modified.count,
              idNames: [
                ...count.modified.idNames,
                ..._.map(res.modified.idNames, (idName) => ({
                  ...idName,
                  name: [name, idName.name].join(".")
                }))
              ]
            }
          };
        },
        this.initDiffCounter()
      );
    }
    return result;
  }

  countDiffLeaf(diffNode) {
    return _.reduce(
      _.keys(diffNode.attributes),
      (r, ii) => {
        const i = diffNode.attributes[ii];
        const startX = i.diff?.finishMissing
          ? getReferencedObjectByXRefPath(
              this.startModel,
              [
                ["tables"],
                ["otherObjects"],
                ["relations"],
                ["tables", "*", "cols"],
                ["tables", "*", "indexes"]
              ],
              ii
            )
          : undefined;

        const startStateCaption = startX
          ? getModelNodeProperty(this.startModel, startX, XProperty.NAME, true)
          : undefined;

        const finishX = i.diff?.startMissing
          ? getReferencedObjectByXRefPath(
              this.finishModel,
              [
                ["tables"],
                ["otherObjects"],
                ["relations"],
                ["tables", "*", "cols"],
                ["tables", "*", "indexes"]
              ],
              ii
            )
          : undefined;
        const finishStateCaption = finishX
          ? getModelNodeProperty(
              this.finishModel,
              finishX,
              XProperty.NAME,
              true
            )
          : undefined;

        const modifiedX = _.isEmpty(i.diff)
          ? getReferencedObjectByXRefPath(
              this.finishModel,
              [
                ["tables"],
                ["otherObjects"],
                ["relations"],
                ["tables", "*", "cols"],
                ["tables", "*", "indexes"]
              ],
              ii
            )
          : undefined;
        const modifiedStateCaption = modifiedX
          ? getModelNodeProperty(
              this.startModel,
              modifiedX,
              XProperty.NAME,
              true
            )
          : undefined;

        const result = {
          added: {
            count: r.added.count + (i.diff?.startMissing ? 1 : 0),
            idNames: [
              ...r.added.idNames,
              ...(finishStateCaption
                ? [{ name: finishStateCaption, id: ii }]
                : [])
            ]
          },
          removed: {
            count: r.removed.count + (i.diff?.finishMissing ? 1 : 0),
            idNames: [
              ...r.removed.idNames,
              ...(startStateCaption
                ? [{ name: startStateCaption, id: ii }]
                : [])
            ]
          },
          modified: {
            count: r.modified.count + (!i.diff ? 1 : 0),
            idNames: [
              ...r.modified.idNames,
              ...(modifiedStateCaption
                ? [{ name: modifiedStateCaption, id: ii }]
                : [])
            ]
          }
        };

        return result;
      },
      this.initDiffCounter()
    );
  }

  crawlNodes(diffNode, path, finishInstancePath) {
    const [firstPathPart, ...restPathParts] = path;

    const finishModelNode = getMappedModelNode(
      this.finishModel,
      pathToString(finishInstancePath)
    )?.node;

    let result = this.initDiffCounter();

    const hasNestedNodes = _.size(path) > 0 && !!firstPathPart;

    if (hasNestedNodes) {
      const isAsteriskNode = firstPathPart === "*";
      if (isAsteriskNode) {
        result = this.crawlAsteriskDiffNode(
          result,
          diffNode,
          restPathParts,
          finishInstancePath
        );

        const total = _.reduce(
          _.keys(finishModelNode),
          (r, key) =>
            r +
            this.crawlNodes(undefined, restPathParts, [
              ...finishInstancePath,
              key
            ]).total,
          0
        );
        result = { ...result, total };
      } else {
        result = this.crawlNodes(
          diffNode?.attributes?.[firstPathPart],
          restPathParts,
          [...finishInstancePath, firstPathPart]
        );
      }
    } else {
      if (!!diffNode) {
        result = {
          ...this.countDiffLeaf(diffNode),
          total: _.size(finishModelNode)
        };
      } else {
        result = { ...this.initDiffCounter(), total: _.size(finishModelNode) };
      }
    }
    return result;
  }

  crawlNodesWithCaption(extendedDiffs, item) {
    return {
      caption: item.caption,
      count: this.crawlNodes(extendedDiffs, item.instancePath, [])
    };
  }

  getSQLiteStatistics() {
    return [
      { caption: "Tables", instancePath: ["tables"] },
      { caption: "Columns", instancePath: ["tables", "*", "cols"] },
      { caption: "Indexes", instancePath: ["tables", "*", "indexes"] },
      { caption: "Relations", instancePath: ["relations"] },
      { caption: "Views", instancePath: ["views"] },
      { caption: "Triggers", instancePath: ["triggers"] }
    ];
  }

  getMySQLFamilyStatistics() {
    return [
      { caption: "Tables", instancePath: ["tables"] },
      { caption: "Columns", instancePath: ["tables", "*", "cols"] },
      { caption: "Indexes", instancePath: ["tables", "*", "indexes"] },
      { caption: "Relations", instancePath: ["relations"] },
      { caption: "Functions", instancePath: ["functions"] },
      { caption: "Procedures", instancePath: ["procedures"] },
      { caption: "Views", instancePath: ["views"] },
      { caption: "Triggers", instancePath: ["triggers"] }
    ];
  }

  getPgStatistics() {
    return [
      { caption: "Tables", instancePath: ["tables"] },
      { caption: "Composites", instancePath: ["composites"] },
      { caption: "Columns", instancePath: ["tables", "*", "cols"] },
      { caption: "Indexes", instancePath: ["tables", "*", "indexes"] },
      { caption: "Relations", instancePath: ["relations"] },
      { caption: "Functions", instancePath: ["functions"] },
      { caption: "Procedures", instancePath: ["procedures"] },
      { caption: "Rule", instancePath: ["rules"] },
      { caption: "Policies", instancePath: ["policies"] },
      { caption: "Sequences", instancePath: ["sequences"] },
      { caption: "Enum", instancePath: ["enums"] },
      { caption: "Domains", instancePath: ["domain"] },
      { caption: "Views", instancePath: ["views"] },
      { caption: "Materialized Views", instancePath: ["mviews"] },
      { caption: "Triggers", instancePath: ["triggers"] }
    ];
  }

  getMSSQLStatistics() {
    return [
      { caption: "Tables", instancePath: ["tables"] },
      { caption: "Columns", instancePath: ["tables", "*", "cols"] },
      { caption: "Indexes", instancePath: ["tables", "*", "indexes"] },
      { caption: "Relations", instancePath: ["relations"] },
      { caption: "Functions", instancePath: ["functions"] },
      { caption: "Procedures", instancePath: ["procedures"] },
      { caption: "Sequences", instancePath: ["sequences"] },
      { caption: "Views", instancePath: ["views"] },
      { caption: "Materialized Views", instancePath: ["mviews"] },
      { caption: "Triggers", instancePath: ["triggers"] },
      { caption: "User Defined Types", instancePath: ["userdefinedtypes"] }
    ];
  }

  getStatisticsByPlatform() {
    switch (this.modelType) {
      case ModelTypes.SQLITE: {
        return this.getSQLiteStatistics();
      }
      case ModelTypes.MARIADB:
      case ModelTypes.MYSQL: {
        return this.getMySQLFamilyStatistics();
      }
      case ModelTypes.PG: {
        return this.getPgStatistics();
      }
      case ModelTypes.MSSQL: {
        return this.getMSSQLStatistics();
      }
    }
  }

  addStatistics(extendedDiffs) {
    const statistics = _.map(this.getStatisticsByPlatform(), (item) => {
      return this.crawlNodesWithCaption(extendedDiffs, item);
    });

    return { statistics, ...extendedDiffs };
  }
}
