import { ModelFinder } from "re";
import { Relations } from "common";
import { RelationsProvider } from "../../common/relation/RelationsProvider";

export class NoRelationsProvider implements RelationsProvider {
    provide(_modelFinder: ModelFinder): Relations {
        return {};
    }
}