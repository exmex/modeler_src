import { CommonColumnLinkReference } from "re";

export class RelationMetadata {
  public cols: CommonColumnLinkReference[] = [];

  public constructor(
    public id: string,
    public name: string,
    public parentKey: string,
    public parent: string,
    public child: string,
    public onDeleteAction: string,
    public onUpdateAction: string,
    public mandatoryParent: string,
    public mandatoryChild: string,
    public cardinalityChild: string,
    public c_cp: string,
    public c_cch: string
  ) {}
}
