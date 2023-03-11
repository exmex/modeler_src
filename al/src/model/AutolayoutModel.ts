import { Component } from "./Component";

export interface AutolayoutModel extends Component {
  components: Component[];
  startPoint: { x: number; y: number };
}
