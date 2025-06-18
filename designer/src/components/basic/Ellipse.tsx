import React from "react";
import { Shape } from "@hella_project/common/validation/schemaDesigner";
import { configToStyle } from "../../utils/styleUtils";

type EllipseProps = { config: Shape };

const Ellipse = ({ config }: EllipseProps) => {
  const style = { ...configToStyle(config), borderRadius: "50%" };

  return <div style={style} />;
};

export default Ellipse;
