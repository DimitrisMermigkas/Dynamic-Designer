import React from "react";
import { useDrop } from "react-dnd";
import Types, { DragAndDropItemType } from "./DragAndDropItemTypes";
import { useTheme } from "@mui/material";

type GeneralDropAreaProps = {
  type?: DragAndDropItemType;
  types?: DragAndDropItemType[];
  onDrop?: (item: any) => void;
  canDrop?: (item: any) => boolean;
} & Omit<React.HTMLProps<HTMLDivElement>, "onDrop">;

const GeneralDropArea = ({ ...props }: GeneralDropAreaProps) => {
  const { type, types, style, children, onDrop, canDrop, ...otherProps } =
    props;
  // const dispatch = useAppDispatch();

  const [collectedProps, drop] = useDrop({
    accept: type
      ? Types[type]
      : types
      ? types.map((type) => Types[type])
      : Object.values(Types),
    drop: (item, monitor) => {
      if (monitor.isOver({ shallow: true })) {
        // dispatch(campaignPageActions.setEnableContentView(false));
        return onDrop?.(item);
      }
    },
    canDrop: (item) => {
      return canDrop ? canDrop(item) : true;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      isOverCurrent: monitor.isOver({ shallow: true }),
      isDragging: !!monitor.getItem(),
      canDrop: monitor.canDrop(),
    }),
  });

  const theme = useTheme();

  let borderStyle =
    collectedProps.canDrop && collectedProps.isOverCurrent
      ? { border: theme.palette.success.main + " dashed 2px" }
      : collectedProps.canDrop && collectedProps.isDragging
      ? { border: "gray dashed 2px" }
      : {};

  return (
    <div
      ref={drop}
      style={{
        ...style,
        ...borderStyle,
      }}
      {...otherProps}
    >
      {children}
    </div>
  );
};

export default GeneralDropArea;
