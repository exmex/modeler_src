import { ObjectType } from "../../../enums/enums";
import Url from "url-parse";
import _ from "lodash";

export const locationChange = (nextLocation, nextStateFocus) => {
  const nextLocationObject = getLocationBrowserObject(nextLocation);

  if (nextStateFocus?.objectId !== nextLocationObject?.objectId) {
    return nextLocationObject;
  }
  return undefined;
};

function getLocationBrowserObject(nextLocation) {
  if (!nextLocation) {
    return undefined;
  }
  return getUrlPathParams(nextLocation);
}

const getUrlPathParameters = (urlPathPattern, path) => {
  if (!urlPathPattern || !path) {
    return undefined;
  }

  const pathSubdirectories = path.split("/").splice(1);
  const parameters = _.reduce(
    urlPathPattern.path,
    (pathParams, urlPathPatternPart, index) => {
      if (isParam(urlPathPatternPart)) {
        if (+index === urlPathPattern.path.length - 1) {
          return {
            ...pathParams,
            [urlPathPatternPart.slice(1)]: pathSubdirectories[index],
            objectId: pathSubdirectories[index]
          };
        }
        return {
          ...pathParams,
          [urlPathPatternPart.slice(1)]: pathSubdirectories[index]
        };
      }
      return pathParams;
    },
    { objectId: undefined }
  );

  return {
    objectType: urlPathPattern.objectType,
    params: _.omit(parameters, "objectId"),
    objectId: parameters?.objectId
  };
};

const isUUID = (uuid) => {
  return (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      uuid
    ) === true
  );
};

const URL_PATHS = [
  {
    objectType: ObjectType.INDEX,
    path: ["model", ":mid", "diagram", ":did", "item", ":id", "ix", ":iid"]
  },
  {
    objectType: ObjectType.INDEX,
    path: ["model", ":mid", "diagram", ":did", "emb", ":id", "ix", ":iid"]
  },
  {
    objectType: ObjectType.COLUMN,
    path: ["model", ":mid", "diagram", ":did", "item", ":id", "col", ":iid"]
  },
  {
    objectType: ObjectType.COLUMN,
    path: ["model", ":mid", "diagram", ":did", "emb", ":id", "col", ":iid"]
  },
  {
    objectType: ObjectType.TABLE,
    path: ["model", ":mid", "diagram", ":did", "item", ":id"]
  },
  {
    objectType: ObjectType.TABLE,
    path: ["model", ":mid", "diagram", ":did", "emb", ":id"]
  },
  {
    objectType: ObjectType.RELATION,
    path: ["model", ":mid", "diagram", ":did", "relation", ":rid"]
  },
  {
    objectType: ObjectType.LINE,
    path: ["model", ":mid", "diagram", ":did", "line", ":lid"]
  },
  {
    objectType: ObjectType.NOTE,
    path: ["model", ":mid", "diagram", ":did", "note", ":nid"]
  },
  {
    objectType: ObjectType.OTHER_OBJECT,
    path: ["model", ":mid", "diagram", ":did", "other", ":oid"]
  },
  {
    objectType: ObjectType.MODEL,
    path: ["model", ":mid", "diagram", ":did", "project", ":pid"]
  },
  {
    objectType: ObjectType.DIAGRAM,
    path: ["model", ":mid", "diagram", ":did"]
  }
];

function getUrlPathParams(nextLocation) {
  const url = Url(nextLocation.pathname, true);
  const urlPathPattern = getUrlPathPatternByPath(url.pathname);
  return getUrlPathParameters(urlPathPattern, url.pathname);
}

function getUrlPathPatternByPath(path) {
  const urlPathSubdirectories = path?.split("/").splice(1);
  if (!urlPathSubdirectories) {
    return undefined;
  }
  return _.find(URL_PATHS, (urlPath) => {
    return (
      urlPath.path.length === urlPathSubdirectories.length &&
      !!_.every(
        urlPath.path,
        (urlPathPatternPart, index) =>
          urlPathPatternPart === urlPathSubdirectories[index] ||
          (isParam(urlPathPatternPart) && isUUID(urlPathSubdirectories[index]))
      )
    );
  });
}

function isParam(urlPathPatternPart) {
  return urlPathPatternPart.startsWith(":");
}

function buildUnstancePathIdFromLocationObject(locationObject) {
  locationObject.objectId;
  locationObject.objectType;
}
