import { fabric } from "fabric";
import html2canvas from "html2canvas";
import { v4 as uuid } from "uuid";
import ReactDOMServer from "react-dom/server";
import {
  ButtonSettings,
  NewsTickerSettings,
  QRCodeSettings,
} from "@jms/designer";
import { pick } from "lodash";

const convertTriggersFromSchema = (dataArray) => {
  return dataArray.map((item) => pick(item, ["type", "action", "referenceId"]));
};

const addCustomObjectSettings = (type, objectExists, existingObj) => {
  let settings;
  if (type === "RSSFeed") {
    if (objectExists) settings = existingObj.settings;
    else settings = NewsTickerSettings;
    return settings;
  } else if (type === "QRCode") {
    if (objectExists) settings = existingObj.settings;
    else settings = QRCodeSettings;
    return settings;
  } else if (type === "Button") {
    if (objectExists) settings = existingObj.settings;
    else settings = ButtonSettings;
    return settings;
  } else if (type === "Weather") {
    if (objectExists) settings = existingObj.settings;
    else
      settings = {
        backgroundColor: "#FFFFFF00",
        borderWidth: 1,
        borderColor: "#00000000",
        borderRadius: 16,
      };
    return settings;
  } else if (type === "Embed") {
    if (objectExists) settings = existingObj.settings;
    else
      settings = {
        backgroundColor: "#FFFFFFFF",
        borderWidth: 1,
        borderColor: "#00000000",
        borderRadius: 0,
        link: "",
      };
    return settings;
  }
};

const createFabricImage = (
  srcUrl,
  typeValue,
  objectExists,
  existingObj,
  canvas
) => {
  //superType exists only on front end, that way the existingObj will be a canvas obj and not just an obj of db.
  //i want to extract the 1st object in each case which has the fill stroke strokeWidth, if obj from db, it has the stroke,fill from the 1st obj.
  // if (existingObj && existingObj.superType && typeValue === "Weather") {
  //   objects = existingObj.getObjects();
  // }

  return new Promise<void>((resolve, reject) => {
    fabric.Image.fromURL(srcUrl, (image) => {
      try {
        const settings = addCustomObjectSettings(
          typeValue,
          objectExists,
          existingObj
        );
        image.set({
          hasControls: false,
          hasBorders: false,
          selectable: false,
          lockMovementX: false,
          lockMovementY: false,
          editable: false,
          rotation: 0,
          // width: settings.width,
          // height: settings.height,
        });
        const rect = new fabric.Rect({
          // stroke: existingObj ? objects[0].stroke : "#000000",
          // strokeWidth: existingObj ? objects[0].strokeWidth : 1,
          fill: "#FFFFFF00",
        });

        if (objectExists) {
          rect.set({
            left: existingObj.left,
            top: existingObj.top,
            height: existingObj.height,
            width: existingObj.width,
          });
          image.set({
            left: existingObj.left,
            top: existingObj.top,
            height: existingObj.height,
            width: existingObj.width,
          });
          canvas.getObjects().forEach((obj) => {
            if (obj.id === existingObj.id) {
              canvas.remove(obj);
            }
          });
        } else {
          //initial position values for customElement
          if (typeValue === "RSSFeed") {
            rect.set({
              top: canvas.height * 0.8,
              left: 0,
              width: canvas.width / canvas.viewportZoom,
            });
            image.set({
              top: canvas.height * 0.8,
              left: 0,
              width: canvas.width / canvas.viewportZoom,
            });
          } else {
            if (Object.keys(existingObj).includes("left")) {
              rect.set({ top: existingObj.top, left: existingObj.left });
              image.set({ top: existingObj.top, left: existingObj.left });
            } else {
              rect.set({ top: canvas.height * 0.5, left: canvas.width * 0.2 });
              image.set({ top: canvas.height * 0.5, left: canvas.width * 0.2 });
            }
          }
        }
        const group = new fabric.Group([rect, image], {
          id: objectExists ? existingObj.id : uuid(),
          superType: "customObject",
          type: typeValue,
          hasControls: true,
          hasBorders: true,
          selectable: true,
          lockMovementX: false,
          lockMovementY: false,
          hoverCursor: "move",
          editable: true,
          rotation: 0,
          angle: objectExists ? existingObj.angle : 0,
          name: `new ${typeValue}`,
          width: image.width,
          height: image.height,
        });
        // Add additional settings for custom object
        group.set("settings", settings);
        // Add additional triggers for button type object
        if (typeValue === "Button" && existingObj?.triggers) {
          const triggers = convertTriggersFromSchema(existingObj.triggers);
          group.set("triggers", triggers);
        }
        // Add the imported image to the canvas or perform any other desired action
        canvas.add(group);
        canvas.renderAll();
        canvas.setActiveObject(group); //TODO only on changes, not on initial load
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
};
const getStringElement = (element) => {
  const buttonString = ReactDOMServer.renderToString(element);
  const parentDiv = document.createElement("div");
  parentDiv.innerHTML = buttonString;
  const stringElement = parentDiv.firstChild;
  parentDiv.style.position = "absolute";
  parentDiv.style.top = "0";
  parentDiv.style.opacity = "0";
  parentDiv.style.boxSizing = "border-box";
  return { parentDiv, stringElement };
};

export const createSnapshotOfElement = async (
  element,
  existingObj,
  canvas,
  type
) => {
  const container = document.querySelector(".designatedArea");
  const { parentDiv, stringElement } = getStringElement(element);

  const objectExists = Object.keys(existingObj).length > 4 ? true : false;

  const elementPropsConfig = element.props.config;
  const scale = existingObj ? existingObj?.width / elementPropsConfig.width : 1;
  // stringElement.style.scale = scale;
  parentDiv.appendChild(stringElement);
  container.appendChild(parentDiv);
  const takeScreenshot = async (
    stringElement,
    typeValue,
    existingObj,
    canvas
  ) => {
    try {
      setTimeout(async () => {
        const can = await html2canvas(stringElement, {
          // canvas: canvas,
          allowTaint: true,
          backgroundColor: null,
          width: stringElement.offsetWidth + 2,
          height: stringElement.offsetHeight + 2,
          scale: type === "RSSFeed" ? 1 : scale,
          useCORS: true,
        });
        container.removeChild(parentDiv);
        const dataUrl = can.toDataURL();
        await createFabricImage(
          dataUrl,
          typeValue,
          objectExists,
          existingObj,
          canvas
        );
      }, 150);
    } catch (error) {
      console.error("oops, something went wrong!", error);
    }
  };
  return takeScreenshot(stringElement, type, existingObj, canvas);
};
