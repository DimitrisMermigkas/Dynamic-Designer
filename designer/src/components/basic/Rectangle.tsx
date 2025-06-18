import React from "react";
import { Shape } from "@client/schemas/schemaDesigner";
import { configToStyle } from "../../utils/styleUtils";

type RectangleProps = { config: Shape };

const Rectangle = ({ config }: RectangleProps) => {
  const style = configToStyle(config);

  return <div style={style} />;
};

export default Rectangle;
