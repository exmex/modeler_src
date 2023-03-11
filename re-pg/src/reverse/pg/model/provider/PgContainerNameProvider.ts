import { ContainerNameProvider } from "re";
import { OtherObjectTypes } from "common";

export class PgContainerNameProvider extends ContainerNameProvider {
  public getContainerPrefixName(obj: any): string {
    return obj?.pg?.schema ? `${obj?.pg?.schema}.` : "";
  }

  public getTablePrefixName(obj: any): string {
    if (obj.type === OtherObjectTypes.Rule) {
      return obj?.pg?.rule?.tablename ? `${obj?.pg?.rule?.tablename}.` : ``;
    } else if (obj.type === OtherObjectTypes.Policy) {
      return obj?.pg?.policy?.tablename ? `${obj?.pg?.policy?.tablename}.` : ``;
    } else if (obj.type === OtherObjectTypes.Trigger) {
      return obj?.pg?.trigger?.tablename
        ? `${obj?.pg?.trigger?.tablename}.`
        : ``;
    }
    return "";
  }
}
