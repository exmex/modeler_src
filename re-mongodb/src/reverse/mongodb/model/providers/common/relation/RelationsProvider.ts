import { ModelFinder } from "re";
import { Relations } from "common";

export interface RelationsProvider {
    provide(modelFinder: ModelFinder): Relations;
}
