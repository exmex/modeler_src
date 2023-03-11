import _ from "lodash";
export class DeltaCalculator {
  constructor(startState, finishState, isArray, isIdArray) {
    this.startState = startState;
    this.finishState = finishState;
    this.isArray = isArray ?? false;
    this.isIdArray = isIdArray ?? false;

    this.reduceDifferentProperties = this.reduceDifferentProperties.bind(this);
  }

  buildResult(result, key, newValue, keyPropertyOptions) {
    result = {
      ...(this.isArray && { isArray: this.isArray }),
      ...result,
      attributes: {
        ...result.attributes,
        [key]: {
          ...keyPropertyOptions,
          ...result.attributes?.[key],
          ...newValue
        }
      }
    };
    return result;
  }

  isLeaf(start, finish) {
    return !_.isObject(start) && !_.isObject(finish);
  }

  doNotChangeAnything(result) {
    return result;
  }

  reduceDifferentProperties(result, startKey, finishKey, unifiedKey) {
    if (
      this.startState[startKey] === undefined &&
      this.finishState[finishKey] === undefined
    ) {
      result = this.doNotChangeAnything(result);
    } else if (this.startState[startKey] === undefined) {
      result = this.startMissing(result, finishKey, unifiedKey);
    } else if (this.finishState[finishKey] === undefined) {
      result = this.finishMissing(result, startKey, unifiedKey);
    } else if (
      !_.isEqual(this.startState[startKey], this.finishState[finishKey])
    ) {
      const tempResult = this.notEqual(startKey, finishKey, unifiedKey, result);
      if (!_.isEmpty(tempResult)) {
        return tempResult;
      }
    }
    return result;
  }

  checkIdArray(arr) {
    const regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/m;
    const containOnlyIds =
      Array.isArray(arr) &&
      _.reduce(arr, (r, item) => !!item?.id?.match(regex), undefined);

    return containOnlyIds;
  }

  notEqual(startKey, finishKey, unifiedKey, result) {
    let innerDifference = {};
    const isIdArray =
      this.checkIdArray(this.startState[startKey]) ||
      this.checkIdArray(this.finishState[finishKey]);
    const isArray =
      !isIdArray &&
      (Array.isArray(this.startState[startKey]) ||
        Array.isArray(this.finishState[finishKey]));
    try {
      if (
        !this.isLeaf(this.startState[startKey], this.finishState[finishKey])
      ) {
        innerDifference = new DeltaCalculator(
          this.startState[startKey],
          this.finishState[finishKey],
          isArray,
          isIdArray
        ).calculate();
      } else {
        innerDifference = {
          startState: this.startState[startKey],
          finishState: this.finishState[finishKey]
        };
      }
      result =
        _.size(innerDifference) === 0
          ? {}
          : this.buildResult(
              result,
              unifiedKey,
              {
                ...innerDifference
              },
              {
                ...(isArray && { isArray: true }),
                ...(isIdArray && { isIdArray: true })
              }
            );
    } catch (err) {
      /* istanbul ignore next */
      console.log(err);
    }
    return result;
  }

  finishMissing(result, key, unifiedKey) {
    result = this.buildResult(
      result,
      unifiedKey ?? key,
      {
        finishMissing: true,
        startState: this.startState[key]
      },
      {}
    );
    return result;
  }

  startMissing(result, key, unifiedKey) {
    result = this.buildResult(
      result,
      unifiedKey ?? key,
      {
        startMissing: true,
        finishState: this.finishState[key]
      },
      {}
    );
    return result;
  }

  calculate() {
    let result = {};
    if (this.isIdArray === true) {
      const startIdsIndexes = _.reduce(
        this.startState,
        (r, item, index) => ({
          ...r,
          [item.id]: { id: item.id, start: index }
        }),
        {}
      );
      const finishIdsIndexes = _.reduce(
        this.finishState,
        (r, item, index) => ({ ...r, [item.id]: index }),
        {}
      );

      const allIdsIndexes = _.reduce(
        this.finishState,
        (r, item, index) => ({
          ...r,
          [item.id]: { ...r[item.id], id: item.id, finish: index }
        }),
        startIdsIndexes
      );

      const startOrder = _.keys(startIdsIndexes);
      const finishOrder = _.keys(finishIdsIndexes);

      const isOrderEqual = _.isEqual(startOrder, finishOrder);

      result = {
        ...(!isOrderEqual ? { startOrder } : {}),
        ...(!isOrderEqual ? { finishOrder } : {}),
        ...(isOrderEqual ? { order: startOrder } : {})
      };

      const arrayOfObjectsWithId = _.reduce(
        allIdsIndexes,
        (r, i) => {
          const startKey = _.isInteger(i.start) ? i.start : undefined;
          const finishKey = _.isInteger(i.finish) ? i.finish : undefined;

          return this.reduceDifferentProperties(r, startKey, finishKey, i.id);
        },
        result
      );

      return arrayOfObjectsWithId;
    }

    const allkeys = _.union(_.keys(this.startState), _.keys(this.finishState));
    return _.reduce(
      allkeys,
      (r, i) => this.reduceDifferentProperties(r, i, i, i),
      result
    );
  }
}
