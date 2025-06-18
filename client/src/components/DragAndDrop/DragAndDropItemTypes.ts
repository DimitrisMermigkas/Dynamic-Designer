const DragAndDropItemTypes = {
  ITEM: "ITEM",
  GROUPITEM: "GROUPITEM",
  FILE: "FILE",
  DEVICE: "DEVICE",
  STORE: "STORE",
  APP: "APP",
  PLAYLIST: "PLAYLIST",
  DESIGN: "DESIGN",
};

export type DragAndDropItemType = keyof typeof DragAndDropItemTypes;

export type DroppedItem<T> = T & { type: DragAndDropItemType };

export default DragAndDropItemTypes as {
  [key in DragAndDropItemType]: DragAndDropItemType;
};
