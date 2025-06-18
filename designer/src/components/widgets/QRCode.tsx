import React from "react";
import { QRCode as QRCodeConfig } from "@client/schemas/schemaDesigner";
import { QRCodeSVG } from "qrcode.react";
import { configToStyle } from "../../utils/styleUtils";
import { getDynamicDetail } from "../../utils/textUtils";

export const QRCodeSettings = {
  staticText: "https://product-me.eu",
  text: "https://product-me.eu",
  dynamicValue: "",
  numberValue: "",
  stringValue: "",
  showRadioGroup: false,
  currentHeight: 128,
  currentWidth: 128,
  typeText: "static",
  backgroundColor: "rgba(255,255,255,0)",
  borderColor: "rgba(255,255,255,0)",
  borderWidth: 0,
};

type QRCodeProps = {
  config: QRCodeConfig;
};

export const QRCode = ({ config }: QRCodeProps) => {
  const style = configToStyle(config);
  style.display = "flex";
  style.justifyContent = "center";
  style.alignItems = "center";

  const text =
    config.settings.typeText === "dynamic"
      ? getDynamicDetail(config.settings.text)
      : config.settings.text;

  return (
    <div style={style}>
      {text && (
        <QRCodeSVG
          includeMargin
          bgColor={"transparent"}
          size={Math.min(config.width || 0, config.height || 0)}
          value={text || ""}
        />
      )}
    </div>
  );
};

export default QRCode;
