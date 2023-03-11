import { Note, Notes } from "common";

import { KnownIdRegistry } from "../../model/provider/KnownIdRegistry";
import { ModelPartProvider } from "../../model/provider/ModelPartProvider";
import { NamesRegistry } from "../../model/NamesRegistry";
import _ from "lodash";

export class NotesProvider implements ModelPartProvider<Notes> {
  private notes: Notes;

  public constructor(
    private _namesRegistry: NamesRegistry,
    private _knownIdRegistry: KnownIdRegistry
  ) {
    this.notes = {};
  }

  public provide(): Promise<Notes> {
    return Promise.resolve(
      _.reduce(
        this._knownIdRegistry.originalModel?.notes,
        (r, note) => {
          this._namesRegistry.registerNote(note);
          return { ...r, [note.id]: note };
        },
        {}
      )
    );
  }

  public addNote(note: Note) {
    this.notes = { ...this.notes, [note.id]: note };
  }
}
