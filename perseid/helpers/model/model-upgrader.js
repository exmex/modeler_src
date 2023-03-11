import { v4 as uuidv4 } from "uuid";

export class ModelUpgrader {
  upgrade(model) {
    if (!model.diagrams) {
      const newModel = this.createDiagramWithItems(model);
      this.removeDiagramInfoFromObjects(newModel, model);
      return newModel;
    }

    return model;
  }

  removeDiagramInfoFromObjects(newModel, model) {
    newModel.tables = this.filterGraphics(model.tables);
    newModel.otherObjects = this.filterGraphics(model.otherObjects);
    newModel.notes = this.filterGraphics(model.notes);
  }

  createDiagramWithItems(model) {
    const newModel = Object.assign({}, model);
    const diagram = this.createDiagram(model);
    newModel.diagrams = { [diagram.id]: diagram };
    newModel.model.activeDiagram = diagram.id;
    return newModel;
  }

  createDiagram(model) {
    return {
      name: "Main Diagram",
      description: "",
      id: uuidv4(),
      keysgraphics: true,
      linegraphics: "detailed",
      color: "transparent",
      background: "transparent",
      lineColor: "transparent",
      isOpen: true,
      zoom: 1,
      scroll: { x: 0, y: 0 },
      main: true,
      diagramItems: {
        ...this.convertObjectToDiagramItem(model.tables),
        ...this.convertObjectToDiagramItem(model.otherObjects),
        ...this.convertObjectToDiagramItem(model.notes)
      }
    };
  }

  convertObjectToDiagramItem(objects) {
    if (!objects) {
      return {};
    }
    return Object.keys(objects)
      .map((key) => objects[key])
      .map((obj) => ({
        referencedItemId: obj.id,
        x: obj.x,
        y: obj.y,
        gHeight: obj.gHeight,
        gWidth: obj.gWidth,
        color: obj.color,
        background: obj.background,
        resized: obj.resized
      }))
      .reduce((r, i) => {
        r[i.referencedItemId] = i;
        return r;
      }, {});
  }

  filterGraphics(objects) {
    if (!objects) {
      return undefined;
    }
    return Object.keys(objects)
      .map((key) => objects[key])
      .map((obj) => {
        const res = Object.assign({}, obj);
        delete res.x;
        delete res.y;
        delete res.gHeight;
        delete res.gWidth;
        delete res.color;
        delete res.background;
        delete res.resized;
        return res;
      })
      .reduce((r, i) => {
        r[i.id] = i;
        return r;
      }, {});
  }
}
