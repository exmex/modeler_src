import { AutolayoutModel } from "./AutolayoutModel";
export class AutoSize {
    public resize(model: AutolayoutModel): void {
        for (const vertice of model.vertices) {
            vertice.autoSize();
        }
    }
}
