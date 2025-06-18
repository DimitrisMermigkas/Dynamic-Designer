import React from "react";
import ItemTypes from "./DragAndDropItemTypes";
import { DragLayer } from "react-dnd";
import styled from "styled-components";

const DragLayerContainer = styled.div`
  position: fixed;
  pointer-events: none;
  z-index: 100;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
`;

const PreviewDiv = styled.div`
  width: 200px;
  display: block;
  padding: 0 17px;
  text-align: left;
  line-height: 40px;
  position: absolute;
`;

const PreviewCircleDiv = styled.div`
  position: absolute;
  height: 26px;
  width: 26px;
  border-radius: 26px;
  border: 2px solid white;
  right: -13px;
  top: -13px;
  background: rgba(172, 221, 183, 1);
  text-align: center;
  line-height: 26px;
`;

const SingleItemDiv = ({ label }) => {
  let previewStyleIndex1 = {
    zIndex: 1000,
    background: "rgba(189, 189, 189, 1)",
  };
  return (
    <div>
      <PreviewDiv style={previewStyleIndex1}>{label}</PreviewDiv>
    </div>
  );
};

const MultipleItemsDiv = ({ numItems, label }) => {
  let previewStyleIndex1 = {
    zIndex: 1000,
    background: "rgba(189, 189, 189, 1)",
  };
  let previewStyleIndex2 = {
    zIndex: 999,
    transform: `translate(${-5}px, ${5}px)`,

    background: "rgba(189, 189, 189, 0.5)",
  };
  let previewStyleIndex3 = {
    zIndex: 998,
    transform: `translate(${-10}px, ${10}px)`,
    background: "rgba(189, 189, 189, 0.5)",
  };

  return (
    <div>
      {numItems > 2 && (
        <PreviewDiv style={previewStyleIndex3}>{label}</PreviewDiv>
      )}
      {numItems > 1 && (
        <PreviewDiv style={previewStyleIndex2}>{label}</PreviewDiv>
      )}
      <PreviewDiv style={previewStyleIndex1}>
        {label}
        {numItems > 1 && <PreviewCircleDiv>{numItems}</PreviewCircleDiv>}
      </PreviewDiv>
    </div>
  );
};

function getItemStyles(props: { clientOffset: { x: number; y: number } }) {
  const { clientOffset } = props;
  if (!clientOffset) {
    return {
      display: "none",
    };
  }

  const { x, y } = clientOffset;
  const transform = `translate(${x - 100}px, ${y - 20}px)`;
  return {
    transform: transform,
    // filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.45))',
    WebkitTransform: transform,
  };
}

const CustomDragLayer = (props: {
  item: any;
  itemType: string;
  currentOffset: { x: number; y: number };
  clientOffset: { x: number; y: number };
  isDragging: boolean;
}) => {
  const renderItem = (type, item) => {
    let childInSelected;
    switch (type) {
      case ItemTypes.GROUPITEM:
        childInSelected = item.selectedItems
          ? item.selectedItems.find((i) => i.ID === item.ID)
          : false;
        if (!item.selectedItems) item.selectedItems = [];

        return childInSelected ? (
          <MultipleItemsDiv
            numItems={item.selectedItems.length}
            label={item.Name}
          />
        ) : (
          <SingleItemDiv label={item.Name} />
        );
      case ItemTypes.APP:
      case ItemTypes.DEVICE:
      case ItemTypes.STORE:
        if (item) {
          childInSelected = item.selectedItems
            ? item.selectedItems.find((i) => i.ID === item.ID)
            : false;
          if (!item.selectedItems) item.selectedItems = [];

          return childInSelected ? (
            <MultipleItemsDiv
              numItems={item.selectedItems.length}
              label={item.Name}
            />
          ) : (
            <SingleItemDiv label={item.Name} />
          );
        }
        break;
      case ItemTypes.FILE:
        if (item && item.name) {
          childInSelected = item.selectedItems
            ? item.selectedItems.find((i) => i.path === item.path)
            : false;
          if (!item.selectedItems) item.selectedItems = [];

          return childInSelected ? (
            <MultipleItemsDiv
              numItems={item.selectedItems.length}
              label={item.name}
            />
          ) : (
            <SingleItemDiv label={item.name} />
          );
        }
        break;
    }
  };

  const { item, itemType, isDragging } = props;
  if (!isDragging) {
    return null;
  }

  return (
    <DragLayerContainer>
      <div style={getItemStyles(props)}>{renderItem(itemType, item)}</div>
    </DragLayerContainer>
  );
};

function collect(monitor) {
  return {
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
    clientOffset: monitor.getClientOffset(),
    isDragging: monitor.isDragging(),
  };
}

export default DragLayer(collect)(CustomDragLayer);
