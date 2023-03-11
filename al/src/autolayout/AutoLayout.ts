import { AutolayoutModel } from "../model/AutolayoutModel";
import { ComponentFinder } from "./component/ComponentFinder";
import { ComponentLayoutComputer } from "./component-layout-computer/ComponentLayoutComputer";
import { ComponentsLayoutComputer } from "./component/ComponentsLayoutComputer";

export class AutoLayout {
  private model: AutolayoutModel;
  private componentFinder: ComponentFinder;
  private componentLayoutComputer: ComponentLayoutComputer;
  private componentsLayoutComputer: ComponentsLayoutComputer;

  public constructor(
    model: AutolayoutModel,
    componentLayoutComputer: ComponentLayoutComputer
  ) {
    this.model = model;
    this.componentFinder = new ComponentFinder();
    this.componentLayoutComputer = componentLayoutComputer;

    this.componentsLayoutComputer = new ComponentsLayoutComputer(
      model.startPoint
    );
  }

  public execute(): void {
    console.log(`Analyzing components`);
    this.model.components = this.componentFinder.find(this.model);
    console.log(`Components found: ${this.model.components.length}`);
    for (const component of this.model.components) {
      //      console.log(`Computing component`);
      this.componentLayoutComputer.compute(component);
      //      console.log(`Updating component`);
      component.update();
      //      console.log(`Component updated`);
    }

    console.log(`Components layout computation`);
    this.componentsLayoutComputer.compute(this.model);
    console.log(`Updating components`);
    this.model.update();
    console.log(`Components updated`);
    console.log(`Autolayout successfully finished`);
  }
}
