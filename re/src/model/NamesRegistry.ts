import { Diagram, Note, OtherObject, Relation, Table } from "common";

import { NameBuilder } from "./provider/NameBuilder";
import { v4 as uuidv4 } from "uuid";

export class NamesRegistry {
  public constructor(private _nameBuilder: NameBuilder) {}

  private nameRegistry: { [key: string]: string } = {};
  private tableRegistry: { [name: string]: Table } = {};
  private tableIdRegistry: { [id: string]: Table } = {};
  private relationRegistry: { [name: string]: Relation } = {};
  private relationIdRegistry: { [id: string]: Relation } = {};
  private otherObjectRegistry: { [name: string]: OtherObject } = {};
  private otherObjectIdRegistry: { [id: string]: OtherObject } = {};
  private noteRegistry: { [name: string]: Note } = {};
  private noteIdRegistry: { [id: string]: Note } = {};
  private diagramIdRegistry: { [id: string]: Diagram } = {};

  public registerName(name: string): string {
    if (!this.nameRegistry[name]) {
      this.nameRegistry[name] = uuidv4();
    }
    return this.nameRegistry[name];
  }

  public table(name: string): Table {
    return this.tableRegistry[name];
  }

  public tableById(id: string): Table {
    return this.tableIdRegistry[id];
  }

  public relation(name: string): Relation {
    return this.relationRegistry[name];
  }

  public relationById(id: string): Relation {
    return this.relationIdRegistry[id];
  }

  public diagramById(id: string): Diagram {
    return this.diagramIdRegistry[id];
  }

  public otherObject(name: string): OtherObject {
    return this.otherObjectRegistry[name];
  }

  public otherObjectById(id: string): OtherObject {
    return this.otherObjectIdRegistry[id];
  }

  public note(name: string): Note {
    return this.noteRegistry[name];
  }

  public noteById(id: string): Note {
    return this.noteIdRegistry[id];
  }

  public get tables(): Table[] {
    return Object.keys(this.tableRegistry).map(
      (key): Table => this.tableRegistry[key]
    );
  }

  public get relations(): Relation[] {
    return Object.keys(this.relationRegistry).map(
      (key): Relation => this.relationRegistry[key]
    );
  }

  public get tablesOfIds(): Table[] {
    return Object.keys(this.tableIdRegistry).map(
      (key): Table => this.tableIdRegistry[key]
    );
  }

  public get otherObjects(): OtherObject[] {
    return Object.keys(this.otherObjectRegistry).map(
      (key): OtherObject => this.otherObjectRegistry[key]
    );
  }

  public get otherObjectsOfIds(): OtherObject[] {
    return Object.keys(this.otherObjectIdRegistry).map(
      (key): OtherObject => this.otherObjectIdRegistry[key]
    );
  }

  public get notes(): Note[] {
    return Object.keys(this.noteRegistry).map(
      (key): Note => this.noteRegistry[key]
    );
  }

  public get notesOfIds(): Note[] {
    return Object.keys(this.noteIdRegistry).map(
      (key): Note => this.noteIdRegistry[key]
    );
  }

  public get diagrams(): Diagram[] {
    return Object.keys(this.diagramIdRegistry).map(
      (key) => this.diagramIdRegistry[key]
    );
  }

  public registerTable(table: Table): void {
    this.tableRegistry[table.name] = table;
    this.tableIdRegistry[table.id] = table;
  }

  public registerRelation(relation: Relation): void {
    this.relationRegistry[relation.name] = relation;
    this.relationIdRegistry[relation.id] = relation;
  }

  public registerDiagram(diagram: Diagram): void {
    this.diagramIdRegistry[diagram.id] = diagram;
  }

  public registerOtherObject(otherObject: OtherObject): void {
    const name = this._nameBuilder.getOtherObjectName(otherObject);
    this.otherObjectRegistry[name] = otherObject;
    this.otherObjectIdRegistry[otherObject.id] = otherObject;
  }

  public registerNote(note: Note): void {
    this.noteRegistry[note.name] = note;
    this.noteIdRegistry[note.id] = note;
  }

  public notRegistredNames(): { id: string; name: string }[] {
    return Object.keys(this.nameRegistry)
      .map((name): { name: string; id: string } => ({
        name,
        id: this.nameRegistry[name]
      }))
      .filter((item): boolean => !this.tableById(item.id))
      .filter((item): boolean => !this.otherObjectById(item.id))
      .filter((item): boolean => !this.noteById(item.id));
  }
}
