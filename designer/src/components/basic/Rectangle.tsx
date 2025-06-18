import React from "react";
import { Shape } from "@hella_project/common/validation/schemaDesigner";
import { configToStyle } from "../../utils/styleUtils";

type RectangleProps = { config: Shape };

const Rectangle = ({ config }: RectangleProps) => {
  const style = configToStyle(config);

  return <div style={style} />;
};

export default Rectangle;
