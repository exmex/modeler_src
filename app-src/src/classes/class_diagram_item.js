export class ClassDiagramItem {
  constructor(referencedItemId, x, y, gHeight, gWidth) {
    this.referencedItemId = referencedItemId;
    this.x = x;
    this.y = y;
    this.gHeight = gHeight;
    this.gWidth = gWidth;
    this.color = "#ffffff";
    this.background = "transparent";
    this.resized = false;
    this.autoExpand = true;
  }
}
