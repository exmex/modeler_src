import _ from "lodash";

export class AbstractMergeChanges {
  constructor(modelState, propertyDifference, rootProperty) {
    this.modelState = modelState;
    this.propertyDifference = propertyDifference;
    this.rootProperty = rootProperty;
  }

  merge() {
    if (!this.propertyDifference.attributes[this.rootProperty]) {
      return { changed: false };
    }

    const newModel = this.mergeProperty(
      this.propertyDifference.attributes[this.rootProperty],
      this.modelState[this.rootProperty],
      this.rootProperty
    );

    return { changed: true, newModel };
  }

  mergePropertyDifference(propertyDifference, result) {
    return result;
  }

  mergeProperty(propertyDifference, currentState, preKey) {
    const mergedInnerProperites = this.mergeInnerProperties(
      propertyDifference,
      currentState,
      preKey
    );
    return this.mergePropertyDifference(
      propertyDifference,
      mergedInnerProperites
    );
  }

  mergeInnerProperties(propertyDifference, currentState, preKey) {
    let result = currentState;
    if (propertyDifference.attributes) {
      const keys = Object.keys(propertyDifference.attributes);
      const keyValues = _.map(keys, (key) => {
        const innerPropertyChange = propertyDifference.attributes[key];
        const value = this.mergeProperty(
          innerPropertyChange,
          currentState[key],
          preKey + "." + key
        );
        return { key, value };
      });
      result = updateInnerDefinedValueProperties(
        keyValues,
        propertyDifference,
        result
      );
      // removal should process from last to first index to prevent wrong index operations
      keyValues.reverse();
      result = updateInnerUndefinedValueProperties(
        keyValues,
        propertyDifference,
        result
      );
    }
    return result;
  }
}
export class MergeChangesStart extends AbstractMergeChanges {
  mergePropertyDifference(propertyDifference, result) {
    if (propertyDifference.startMissing === true) {
      result = propertyDifference.isArray === true ? [] : undefined;
    } else if (propertyDifference.finishMissing === true) {
      result = propertyDifference.startState;
    } else if (
      propertyDifference.startState !== undefined &&
      propertyDifference.finishState !== undefined
    ) {
      result = propertyDifference.startState;
    }
    return result;
  }
}

export class MergeChangesFinish extends AbstractMergeChanges {
  mergePropertyDifference(propertyDifference, result) {
    if (propertyDifference.startMissing === true) {
      result = propertyDifference.finishState;
    } else if (propertyDifference.finishMissing === true) {
      result = propertyDifference.isArray === true ? [] : undefined;
    } else if (
      propertyDifference.startState !== undefined &&
      propertyDifference.finishState !== undefined
    ) {
      result = propertyDifference.finishState;
    }
    return result;
  }
}
function updateInnerUndefinedValueProperties(
  keyValues,
  propertyDifference,
  result
) {
  for (const { value, key } of keyValues) {
    if (value === undefined) {
      if (propertyDifference.isArray === true) {
        result = [...result];
        result.splice(+key, 1);
      } else {
        result = _.omit({ ...result }, [key]);
      }
    }
  }
  return result;
}

function updateInnerDefinedValueProperties(
  keyValues,
  propertyDifference,
  result
) {
  for (const { value, key } of keyValues) {
    if (value !== undefined) {
      {
        if (propertyDifference.isArray === true) {
          if (result[+key]) {
            result = [...result];
            result[key] = value;
          } else {
            result = [...result];
            result.splice(+key, 0, value);
          }
        } else {
          result = { ...result };
          result[key] = value;
        }
      }
    }
  }
  return result;
}
