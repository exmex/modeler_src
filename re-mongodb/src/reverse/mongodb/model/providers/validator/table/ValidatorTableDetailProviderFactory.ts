import { Collection } from "../../../../../../db/mongodb/MongoDBHandledConnection";
import { NamesRegistry } from "re";
import { NestedDocumentStructureRegistry } from "../../common/NestedDocumentStructureRegistry";
import { ParentProcesNotification } from "../../../../ParentProcessNotification";
import { TableDetailProvider } from "../../common/table/TableDetailProvider";
import { TableDetailProviderFactory } from "../../common/table/TableDetailProviderFactory";
import { ValidatorDatatypeProvider } from "../column/ValidatorDatatypeProvider";
import { ValidatorNestedDocumentProvider } from "./ValidatorNestedDocumentProvider";
import { ValidatorTableDetailProvider } from "./ValidatorTableDetailProvider";

export class ValidatorTableDetailProviderFactory
  implements TableDetailProviderFactory
{
  constructor(
    private nestedDocumentStructureRegistry: NestedDocumentStructureRegistry,
    private progress: ParentProcesNotification,
    private namesRegistry: NamesRegistry
  ) {}

  public build(collection: Collection): Promise<TableDetailProvider> {
    const result = new ValidatorTableDetailProvider(
      collection,
      new ValidatorDatatypeProvider(
        new ValidatorNestedDocumentProvider(),
        this.nestedDocumentStructureRegistry,
        this.namesRegistry
      )
    );
    this.progress.sendPartProgressChange(collection.name, 1);
    return Promise.resolve(result);
  }
}
