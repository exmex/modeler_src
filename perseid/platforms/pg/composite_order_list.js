import _ from "lodash";

export function orderCompositesByDependencies(allComposites) {
  const orderedComposites = _.orderBy(allComposites, ["name"], ["desc"]);

  const token = {
    allComposites: orderedComposites,
    availableComposites: orderedComposites,
    result: []
  };

  while (token.availableComposites.length > 0) {
    const currentComposite = token.availableComposites.pop();
    addAncestorsToResultRecursively(currentComposite, token);
  }
  return token.result;
}

function ancestorNotFound(result, id) {
  return result.findIndex(oc => oc === id) === -1;
}

function addAncestorsToResultRecursively(currentComposite, token) {
  const ancestorComposites = findAncestorComposites(
    currentComposite,
    token.allComposites
  );
  ancestorComposites.forEach(ancestorComposite => {
    if (ancestorNotFound(token.result, ancestorComposite.id)) {
      addAncestorsToResultRecursively(ancestorComposite, token);
    }
  });
  if (ancestorNotFound(token.result, currentComposite.id)) {
    token.result.push(currentComposite.id);
  }
}

function findAncestorComposites(currentComposite, allComposites) {
  return allComposites.filter(c =>
    currentComposite.cols.find(current => current.datatype === c.id)
  );
}
