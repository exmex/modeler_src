import _ from "lodash";
export class DeltaCalculator {
  constructor(startState, finishState, isArray) {
    this.startState = startState;
    this.finishState = finishState;
    this.isArray = isArray;
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

  reduceDifferentProperties(result, key) {
    if (
      this.startState[key] === undefined &&
      this.finishState[key] === undefined
    ) {
      //result = this.bothMissing(result, key);
    } else if (this.startState[key] === undefined) {
      result = this.startMissing(result, key);
    } else if (this.finishState[key] === undefined) {
      result = this.finishMissing(result, key);
    } else if (!_.isEqual(this.startState[key], this.finishState[key])) {
      result = this.notEqual(key, result);
    }
    return result;
  }

  notEqual(key, result) {
    let innerDifference = {};
    const isArray =
      Array.isArray(this.startState[key]) ||
      Array.isArray(this.finishState[key]);
    try {
      if (!this.isLeaf(this.startState[key], this.finishState[key])) {
        innerDifference = new DeltaCalculator(
          this.startState[key],
          this.finishState[key],
          isArray
        ).calculate();
      } else {
        innerDifference = {
          startState: this.startState[key],
          finishState: this.finishState[key]
        };
      }
      result =
        _.size(innerDifference) === 0
          ? {}
          : this.buildResult(
              result,
              key,
              {
                ...innerDifference
              },
              {
                ...(isArray && { isArray: true })
              }
            );
    } catch (err) {
      console.log(err);
    }
    return result;
  }

  finishMissing(result, key) {
    result = this.buildResult(
      result,
      key,
      {
        finishMissing: true,
        startState: this.startState[key]
      },
      {}
    );
    return result;
  }

  startMissing(result, key) {
    result = this.buildResult(
      result,
      key,
      {
        startMissing: true,
        finishState: this.finishState[key]
      },
      {}
    );
    return result;
  }

  bothMissing(result, key) {
    result = this.buildResult(
      result,
      key,
      {
        startMissing: true,
        finishMissing: true
      },
      {}
    );
    return result;
  }

  calculate() {
    const allkeys = _.union(_.keys(this.startState), _.keys(this.finishState));
    return _.reduce(allkeys, this.reduceDifferentProperties.bind(this), {});
  }
}
