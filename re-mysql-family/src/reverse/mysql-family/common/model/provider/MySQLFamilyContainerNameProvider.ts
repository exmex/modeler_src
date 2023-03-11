import { ContainerNameProvider } from "re";

export class MySQLFamilyContainerNameProvider extends ContainerNameProvider {
  public getContainerPrefixName(obj: any): string {
    return obj?.database ? `${obj?.database}.` : "";
  }
}
