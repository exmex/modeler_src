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

  getDefinedOrderList(propertyDifference) {
    return [];
  }

  getUndefinedOrderList(propertyDifference) {
    return [];
  }

  mergeInnerProperties(propertyDifference, currentState, preKey) {
    let result = currentState;
    if (propertyDifference.attributes) {
      const x = this.getDefinedOrderList(propertyDifference);
      const keys = _.uniq([
        ...Object.keys(propertyDifference.attributes),
        ...(!!x ? x : [])
      ]);

      const keyValues = _.map(keys, (key) => {
        const innerPropertyChange = propertyDifference.attributes[key];
        if (innerPropertyChange) {
          const index = _.indexOf(
            this.getUndefinedOrderList(propertyDifference),
            key
          );
          const innerKey = index === -1 ? key : index;

          //          console.dir({ propertyDifference, currentState, preKey });

          const value = this.mergeProperty(
            innerPropertyChange,
            currentState[innerKey],
            preKey + "." + innerKey
          );
          return { key, value };
        } else {
          // console.dir({
          //   currentState,
          //   preKey,
          //   key,
          //   value: currentState.find((item) => item.id === key)
          // });
          // console.dir(
          //   {
          //     s1: {
          //       key,
          //       value: currentState.find((item) => item.id === key)
          //     }
          //   },
          //   { depth: 20 }
          // );
          return { key, value: currentState.find((item) => item.id === key) };
        }
      });
      // console.dir(
      //   { keyValues, mergeInnerProperties_0: { preKey, result } },
      //   { depth: 10 }
      // );
      result = this.updateInnerDefinedValueProperties(
        keyValues,
        propertyDifference,
        result
      );

      // console.dir(
      //   { after_updateInnerDefinedValueProperties: { preKey, result } },
      //   { depth: 10 }
      // );
      // removal should process from last to first index to prevent wrong index operations
      keyValues.reverse();
      result = this.updateInnerUndefinedValueProperties(
        keyValues,
        propertyDifference,
        result
      );
    } else if (propertyDifference.isIdArray && propertyDifference.startOrder) {
      const s = this.getDefinedOrderList(propertyDifference);
      if (s) {
        // console.dir({ result, s });
        result.sort((a, b) => {
          return s.indexOf(a.id) - s.indexOf(b.id);
        });
      }
    }

    // console.dir(
    //   {
    //     mergeInnerProperties_2: {
    //       preKey,
    //       result,
    //       s: this.getDefinedOrderList(propertyDifference)
    //     }
    //   },
    //   { depth: 10 }
    // );
    if (this.getDefinedOrderList(propertyDifference)) {
      result = _.filter(
        result,
        (i) => (obj) =>
          this.getDefinedOrderList(propertyDifference).includes(obj.id)
      );
    }
    //    console.dir({ mergeInnerProperties_3: { preKey, result } }, { depth: 10 });
    return result;
  }

  updateInnerUndefinedValueProperties(keyValues, propertyDifference, result) {
    // console.dir(
    //   { updateInnerUndefinedValueProperties: { keyValues } },
    //   { depth: 10 }
    // );
    for (const { value, key } of keyValues) {
      if (value === undefined) {
        if (propertyDifference.isIdArray === true) {
          const index = _.indexOf(
            this.getDefinedOrderList(propertyDifference),
            key
          );
          const rx = result;
          result = [...result];
          result.splice(+index, 1);
        } else if (propertyDifference.isArray === true) {
          result = [...result];
          result.splice(+key, 1);
        } else {
          result = _.omit({ ...result }, [key]);
        }
      }
    }
    return result;
  }

  updateInnerDefinedValueProperties(keyValues, propertyDifference, result) {
    for (const { value, key } of keyValues) {
      if (value !== undefined) {
        {
          if (propertyDifference.isIdArray === true) {
            const index = _.indexOf(
              this.getDefinedOrderList(propertyDifference),
              key
            );
            //console.dir({ result, key, value });
            result = _.filter(result, (item) => item.id !== key);
            //console.dir({ result, index, value });
            result.splice(+index, 0, value);
            //console.dir({ result });
          } else if (propertyDifference.isArray === true) {
            if (!!result[+key]) {
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
}
export class MergeChangesStart extends AbstractMergeChanges {
  constructor(modelState, propertyDifference, rootProperty) {
    super(modelState, propertyDifference, rootProperty);
  }

  mergePropertyDifference(propertyDifference, result) {
    if (propertyDifference.startMissing === true) {
      result =
        propertyDifference.isIdArray === true ||
        propertyDifference.isArray === true
          ? []
          : undefined;
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

  getDefinedOrderList(propertyDifference) {
    return propertyDifference.startOrder ?? propertyDifference.order;
  }

  getUndefinedOrderList(propertyDifference) {
    return propertyDifference.finishOrder ?? propertyDifference.order;
  }
}

export class MergeChangesFinish extends AbstractMergeChanges {
  constructor(modelState, propertyDifference, rootProperty) {
    super(modelState, propertyDifference, rootProperty);
  }

  mergePropertyDifference(propertyDifference, result) {
    if (propertyDifference.startMissing === true) {
      result = propertyDifference.finishState;
    } else if (propertyDifference.finishMissing === true) {
      result =
        propertyDifference.isIdArray === true ||
        propertyDifference.isArray === true
          ? []
          : undefined;
    } else if (
      propertyDifference.startState !== undefined &&
      propertyDifference.finishState !== undefined
    ) {
      result = propertyDifference.finishState;
    }
    return result;
  }

  getDefinedOrderList(propertyDifference) {
    return propertyDifference.finishOrder ?? propertyDifference.order;
  }

  getUndefinedOrderList(propertyDifference) {
    return propertyDifference.startOrder ?? propertyDifference.order;
  }
}
