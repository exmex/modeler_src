import { Component } from "../../model/Component";

export interface ComponentLayoutComputer {
    compute(component: Component): void;
}
