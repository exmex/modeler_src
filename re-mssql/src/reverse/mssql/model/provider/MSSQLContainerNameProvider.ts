import { ContainerNameProvider } from "re";
import { OtherObjectTypes } from "common";

export class MSSQLContainerNameProvider extends ContainerNameProvider {
  public getContainerPrefixName(obj: any): string {
    return obj?.mssql?.schema ? `${obj?.mssql?.schema}.` : "";
  }

  public getTablePrefixName(obj: any): string {
    if (obj.type === OtherObjectTypes.Trigger) {
      return obj?.mssql?.trigger?.tablename
        ? `${obj?.mssql?.trigger?.tablename}.`
        : ``;
    }
    return "";
  }
}
