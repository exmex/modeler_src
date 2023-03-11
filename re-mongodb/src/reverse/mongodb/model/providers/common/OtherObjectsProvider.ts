import { ModelPartProvider } from "re";
import { OtherObjects } from "common";

export class OtherObjectsProvider implements ModelPartProvider<OtherObjects> {
    public provide(): Promise<OtherObjects> {
        return Promise.resolve({});
    }
}
