import React from "react";
import RssFeedIcon from "@mui/icons-material/RssFeed";
import LanguageIcon from "@mui/icons-material/Language";
import RadioIcon from "@mui/icons-material/Radio";
import GetAppIcon from "@mui/icons-material/GetApp";
import { GridSize } from "@mui/material/Grid2";

type ElementOptionBase = {
  name: string;
  label?: string;
  gridWidth: GridSize;
  initValue: any;
  groupLabel: string;
};

export type FabricElementOptionSchema = ElementOptionBase &
  (
    | { type: "colorPicker" }
    | { type: "select"; options: any[]; style?: React.CSSProperties }
    | { type: "autocomplete"; options: any[] }
    | { type: "slider"; options: { min: number; max: number; step: number } }
    | { type: "iconButton"; icon: any; functionProp: any }
    | { type: "selectWithIcons"; options: any[] }
    | { type: "dynamicText"; options: any[] }
    | { type: "autocompleteVirtualized"; options: any[] }
    | {
        type:
          | "textfield"
          | "checkbox"
          | "Button"
          | "Weather"
          | "Embed"
          | "RSSFeed"
          | "QRCode";
      }
  );

const ElementsSchema = ({ type, t }) => {
  let fields: FabricElementOptionSchema[] = [];
  switch (type) {
    case "Button":
      fields = [
        {
          name: "backgroundColor",
          type: "colorPicker",
          label: t("DesignerTranslations.t.backgroundColor"),
          initValue: "#FFFFFF",
          groupLabel: t("DesignerTranslations.t.buttonStyle"),
          gridWidth: 12,
        },
        {
          name: "borderColor",
          type: "colorPicker",
          label: t("DesignerTranslations.t.borderColor"),
          initValue: "#e51a29",
          groupLabel: t("DesignerTranslations.t.buttonStyle"),
          gridWidth: 12,
        },
        {
          name: "borderRadius",
          type: "select",
          label: t("DesignerTranslations.t.borderRadius"),
          initValue: 4,
          groupLabel: t("DesignerTranslations.t.buttonStyle"),
          options: Array.from({ length: 31 }, (_, index) => ({
            value: index,
            label: index.toString(),
          })),
          gridWidth: 12,
        },
        {
          name: "borderWidth",
          type: "select",
          label: t("DesignerTranslations.t.borderWidth"),
          initValue: 1,
          groupLabel: t("DesignerTranslations.t.buttonStyle"),
          options: Array.from({ length: 4 }, (_, index) => ({
            value: index,
            label: index.toString(),
          })),
          gridWidth: 12,
        },
        {
          name: "buttonText",
          type: "textfield",
          label: t("DesignerTranslations.t.buttonText"),
          initValue: "Button",
          groupLabel: t("DesignerTranslations.t.textStyle"),
          gridWidth: 12,
        },
        {
          name: "buttonTextColor",
          type: "colorPicker",
          label: t("DesignerTranslations.t.textColor"),
          initValue: "#1C1D21",
          groupLabel: t("DesignerTranslations.t.textStyle"),
          gridWidth: 12,
        },
        {
          name: "fontFamily",
          type: "select",
          label: t("DesignerTranslations.t.fontFamily"),
          initValue: "Poppins",
          groupLabel: t("DesignerTranslations.t.textStyle"),
          options: [
            { label: "Arial", value: "Arial" },
            { label: "Helvetica", value: "Helvetica" },
            { label: "Times New Roman", value: "Times New Roman" },
            { label: "Courier New", value: "Courier New, monospace" },
            { label: "Verdana", value: "Verdana" },
            { label: "Georgia", value: "Georgia" },
            { label: "Comic Sans MS", value: "Comic Sans MS" },
            { label: "Poppins", value: "Poppins" },
          ],
          gridWidth: 12,
          style: { maxWidth: "160px" },
        },
        {
          name: "fontSize",
          type: "autocomplete",
          label: t("DesignerTranslations.t.fontSize"),
          initValue: 16,
          groupLabel: t("DesignerTranslations.t.textStyle"),
          options: [
            { label: "10", value: 10 },
            { label: "11", value: 11 },
            { label: "12", value: 12 },
            { label: "13", value: 13 },
            { label: "14", value: 14 },
            { label: "15", value: 15 },
            { label: "16", value: 16 },
            { label: "20", value: 20 },
            { label: "24", value: 24 },
            { label: "32", value: 32 },
            { label: "36", value: 36 },
            { label: "40", value: 40 },
            { label: "48", value: 48 },
            { label: "64", value: 64 },
            { label: "96", value: 96 },
            { label: "128", value: 128 },
          ],
          gridWidth: 12,
        },
      ];
      break;
    case "Weather":
      fields = [
        {
          name: "backgroundColor",
          type: "colorPicker",
          label: t("DesignerTranslations.t.backgroundColor"),
          initValue: "#FFFFFFFF",
          groupLabel: t("DesignerTranslations.t.weatherStyle"),
          gridWidth: 12,
        },
        {
          name: "textColor",
          type: "colorPicker",
          label: t("DesignerTranslations.t.textColor"),
          initValue: "#000000FF",
          groupLabel: t("DesignerTranslations.t.weatherStyle"),
          gridWidth: 12,
        },
        {
          name: "borderColor",
          type: "colorPicker",
          label: t("DesignerTranslations.t.borderColor"),
          initValue: "#FFFFFFFF",
          groupLabel: t("DesignerTranslations.t.weatherStyle"),
          gridWidth: 12,
        },
        {
          name: "borderRadius",
          type: "select",
          label: t("DesignerTranslations.t.borderRadius"),
          initValue: 16,
          groupLabel: t("DesignerTranslations.t.weatherStyle"),
          options: Array.from({ length: 31 }, (_, index) => ({
            value: index,
            label: index.toString(),
          })),
          gridWidth: 12,
        },
        {
          name: "borderWidth",
          type: "select",
          label: t("DesignerTranslations.t.borderWidth"),
          initValue: 1,
          groupLabel: t("DesignerTranslations.t.weatherStyle"),
          options: Array.from({ length: 4 }, (_, index) => ({
            value: index,
            label: index.toString(),
          })),
          gridWidth: 12,
        },
      ];
      break;
    case "Embed":
      fields = [
        {
          name: "embedLink",
          type: "textfield",
          label: "Embedded link",
          initValue: "",
          groupLabel: "Embed Style",
          gridWidth: 8,
        },
        {
          name: "link",
          type: "iconButton",
          icon: <GetAppIcon />,
          initValue: "",
          groupLabel: "Embed Style",
          functionProp: "embedLink",
          gridWidth: 4,
        },
        {
          name: "backgroundColor",
          type: "colorPicker",
          label: t("DesignerTranslations.t.backgroundColor"),
          initValue: "#FFFFFFFF",
          groupLabel: "Embed Style",
          gridWidth: 12,
        },
        {
          name: "borderColor",
          type: "colorPicker",
          label: t("DesignerTranslations.t.borderColor"),
          initValue: "#00000000",
          groupLabel: "Embed Style",
          gridWidth: 12,
        },
        {
          name: "borderRadius",
          type: "select",
          label: t("DesignerTranslations.t.borderRadius"),
          initValue: 0,
          groupLabel: "Embed Style",
          options: Array.from({ length: 31 }, (_, index) => ({
            value: index,
            label: index.toString(),
          })),
          gridWidth: 12,
        },
        {
          name: "borderWidth",
          type: "select",
          label: t("DesignerTranslations.t.borderWidth"),
          initValue: 1,
          groupLabel: "Embed Style",
          options: Array.from({ length: 4 }, (_, index) => ({
            value: index,
            label: index.toString(),
          })),
          gridWidth: 12,
        },
      ];
      break;
    case "RSSFeed":
      fields = [
        {
          name: "link",
          type: "textfield",
          label: t("DesignerTranslations.t.siteLink"),
          initValue: "",
          groupLabel: t("DesignerTranslations.t.newsTickerData"),
          gridWidth: 8,
        },
        {
          name: "newsArray",
          type: "iconButton",
          icon: <GetAppIcon />,
          initValue: [],
          groupLabel: t("DesignerTranslations.t.newsTickerData"),
          functionProp: "link",
          gridWidth: 4,
        },
        {
          name: "animationType",
          type: "select",
          label: "",
          initValue: "scrollLeft",
          groupLabel: t("DesignerTranslations.t.animation"),
          options: [
            {
              value: "scrollLeft",
              label: t("DesignerTranslations.t.scrollLeft"),
            },
            {
              value: "scrollRight",
              label: t("DesignerTranslations.t.scrollRight"),
            },
            { value: "slideTop", label: t("DesignerTranslations.t.slideTop") },
            {
              value: "slideBottom",
              label: t("DesignerTranslations.t.slideBottom"),
            },
          ],
          gridWidth: 12,
        },
        {
          name: "animationDuration",
          type: "slider",
          label: t("DesignerTranslations.t.speed"),
          initValue: 20,
          options: { min: 1, max: 30, step: 1 },
          groupLabel: t("DesignerTranslations.t.animation"),
          gridWidth: 12,
        },
        {
          name: "newsColor",
          type: "colorPicker",
          label: t("DesignerTranslations.t.tickerNewsColor"),
          initValue: "#1C1D21",
          groupLabel: t("DesignerTranslations.t.tickerStyle"),
          gridWidth: 12,
        },
        {
          name: "tickerColor",
          type: "colorPicker",
          label: t("DesignerTranslations.t.headingColor"),
          initValue: "#e51a29",
          groupLabel: t("DesignerTranslations.t.tickerStyle"),
          gridWidth: 12,
        },
        {
          name: "tickerIcon",
          type: "selectWithIcons",
          label: "",
          initValue: "rss",
          groupLabel: t("DesignerTranslations.t.tickerIcon"),
          options: [
            { component: <RssFeedIcon />, label: "Rss", value: "rss" },
            { component: <LanguageIcon />, label: "Globe", value: "globe" },
            { component: <RadioIcon />, label: "Radio", value: "radio" },
          ],
          gridWidth: 6,
        },
        {
          name: "fontFamily",
          type: "select",
          label: t("DesignerTranslations.t.fontFamily"),
          initValue: "Poppins, sans-serif",
          groupLabel: t("DesignerTranslations.t.textStyle"),
          options: [
            { label: "Arial", value: "Arial, sans-serif" },
            { label: "Helvetica", value: "Helvetica, sans-serif" },
            { label: "Times New Roman", value: "Times New Roman, serif" },
            { label: "Courier New", value: "Courier New, monospace" },
            { label: "Verdana", value: "Verdana, sans-serif" },
            { label: "Georgia", value: "Georgia, serif" },
            { label: "Comic Sans MS", value: "Comic Sans MS, cursive" },
            { label: "Poppins", value: "Poppins, sans-serif" },
          ],
          gridWidth: 12,
          style: { maxWidth: "160px" },
        },
        {
          name: "fontSize",
          type: "autocomplete",
          label: t("DesignerTranslations.t.fontSize"),
          initValue: 32,
          groupLabel: t("DesignerTranslations.t.textStyle"),
          options: [
            { label: "10", value: 10 },
            { label: "11", value: 11 },
            { label: "12", value: 12 },
            { label: "13", value: 13 },
            { label: "14", value: 14 },
            { label: "15", value: 15 },
            { label: "16", value: 16 },
            { label: "20", value: 20 },
            { label: "24", value: 24 },
            { label: "32", value: 32 },
            { label: "36", value: 36 },
            { label: "40", value: 40 },
            { label: "48", value: 48 },
            { label: "64", value: 64 },
            { label: "96", value: 96 },
            { label: "128", value: 128 },
          ],
          gridWidth: 12,
        },
        {
          name: "tickerText",
          type: "textfield",
          label: t("DesignerTranslations.t.tickerText"),
          initValue: "Latest News",
          groupLabel: t("DesignerTranslations.t.textStyle"),
          gridWidth: 12,
        },
        {
          name: "tickerTextColor",
          type: "colorPicker",
          label: t("DesignerTranslations.t.headingTextColor"),
          initValue: "#1C1D21",
          groupLabel: t("DesignerTranslations.t.textStyle"),
          gridWidth: 12,
        },
        {
          name: "newsTextColor",
          type: "colorPicker",
          label: t("DesignerTranslations.t.tickerTextColor"),
          initValue: "#e51a29",
          groupLabel: t("DesignerTranslations.t.textStyle"),
          gridWidth: 12,
        },
      ];
      break;
    case "QRCode":
      fields = [
        {
          name: "staticText",
          type: "textfield",
          label: t("DesignerTranslations.t.staticText"),
          initValue: "https://product-me.eu",
          groupLabel: t("DesignerTranslations.t.qrcodeText"),
          gridWidth: 10,
        },
        {
          name: "QRCheckboxStatic",
          type: "checkbox",
          initValue: "static",
          groupLabel: t("DesignerTranslations.t.qrcodeText"),
          gridWidth: 2,
        },
        {
          name: "dynamicValue",
          type: "autocompleteVirtualized",
          label: t("DesignerTranslations.t.dynamicText"),
          initValue: "",
          groupLabel: t("DesignerTranslations.t.qrcodeText"),
          options: [
            // { label: "DeviceName", value: "DeviceName" },
            { label: "DeviceDescription", value: "DeviceDescription" },
            { label: "DeviceCode", value: "DeviceCode" },
            // { label: "BranchName", value: "BranchName" },
            { label: "BranchCode", value: "BranchCode" },
            { label: "Price", value: "Price" },
            { label: "ButlerPrice", value: "ButlerPrice" },
            { label: "StorePrice", value: "StorePrice" },
            { label: "DeviceDetail", value: "DeviceDetail" },
          ],
          gridWidth: 10,
        },
        {
          name: "QRCheckboxDynamic",
          type: "checkbox",
          initValue: "dynamic",
          groupLabel: t("DesignerTranslations.t.qrcodeText"),
          gridWidth: 2,
        },
        {
          name: "backgroundColor",
          type: "colorPicker",
          label: t("DesignerTranslations.t.backgroundColor"),
          initValue: "rgba(255,255,255,0)",
          groupLabel: t("DesignerTranslations.t.qrcodeStyle"),
          gridWidth: 12,
        },
        {
          name: "foregroundColor",
          type: "colorPicker",
          label: t("DesignerTranslations.t.textColor"),
          initValue: "#000000FF",
          groupLabel: t("DesignerTranslations.t.qrcodeStyle"),
          gridWidth: 12,
        },
        {
          name: "borderColor",
          type: "colorPicker",
          label: t("DesignerTranslations.t.borderColor"),
          initValue: "rgba(255,255,255,0)",
          groupLabel: t("DesignerTranslations.t.qrcodeStyle"),
          gridWidth: 12,
        },
        {
          name: "borderWidth",
          type: "select",
          label: t("DesignerTranslations.t.borderWidth"),
          initValue: 0,
          groupLabel: t("DesignerTranslations.t.qrcodeStyle"),
          options: Array.from({ length: 4 }, (_, index) => ({
            value: index,
            label: index.toString(),
          })),
          gridWidth: 12,
        },
      ];
    default:
  }
  return fields;
};

export default ElementsSchema;
