import { Line, Lines, Note } from "common";

import { KnownIdRegistry } from "../../model/provider/KnownIdRegistry";
import { ModelPartProvider } from "../../model/provider/ModelPartProvider";
import { NamesRegistry } from "../../model/NamesRegistry";
import _ from "lodash";

export class LinesProvider implements ModelPartProvider<Lines> {
  private lines: Lines;

  public constructor(
    private _namesRegistry: NamesRegistry,
    private _knownIdRegistry: KnownIdRegistry
  ) {
    this.lines = {};
  }

  public provide(): Promise<Lines> {
    return Promise.resolve(
      _.reduce(
        this._knownIdRegistry.originalModel?.lines,
        (r, line) => {
          const parent = this.getParent(line);
          const child = this.getChild(line);
          const lineExists = !!parent && !!child;
          if (lineExists) {
            this.updateNotExistingParentChildLines(parent, line, child);
            return { ...r, [line.id]: line };
          } else {
            this.removeLinesFromParentChild(parent, line, child);
          }
          return r;
        },
        {}
      )
    );
  }

  private removeLinesFromParentChild(parent: Note, line: Line, child: Note) {
    if (!!parent) {
      parent.lines = _.filter(parent.lines, (lineId) => lineId !== line.id);
    }
    if (!!child) {
      child.lines = _.filter(child.lines, (lineId) => lineId !== line.id);
    }
  }

  private updateNotExistingParentChildLines(
    parent: Note,
    line: Line,
    child: Note
  ) {
    if (!_.find(parent.lines, (lineId) => lineId === line.id)) {
      parent.lines.push(line.id);
    }
    if (!_.find(child.lines, (lineId) => lineId === line.id)) {
      child.lines.push(line.id);
    }
  }

  private getChild(line: Line) {
    return (
      this._namesRegistry.tableById(line.child) ||
      this._namesRegistry.otherObjectById(line.child) ||
      this._namesRegistry.noteById(line.child)
    );
  }

  private getParent(line: Line) {
    return (
      this._namesRegistry.tableById(line.parent) ||
      this._namesRegistry.otherObjectById(line.parent) ||
      this._namesRegistry.noteById(line.parent)
    );
  }

  public addLine(line: Line) {
    this.lines = { ...this.lines, [line.id]: line };
  }
}
