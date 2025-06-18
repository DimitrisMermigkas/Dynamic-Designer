import { fabric } from "fabric";
import { v4 as uuid } from "uuid";
import {
  createObjectGroup,
  getThumbnailFromCanvas,
  loadImageElement,
  loadVideoThumbnail,
  multiMediaObjectFit,
} from "../FabricComponents/MultimediaHelper";

const useMultiMediaHandlers = ({ canvas }) => {
  const addDroppedMediaFromPC = (file, fileData, selectedObj) => {
    const groupOptions = {
      left: selectedObj.left,
      top: selectedObj.top,
      width: selectedObj.width,
      height: selectedObj.height,
      objectCaching: false,
      type: "Multimedia",
      originX: "left",
      originY: "top",
      transformOrigin: "left top",
      id: uuid(),
    };

    if (file.type.split("/")[0] == "image") {
      // Create an Image object to get the width and height of the image
      const image = new Image();
      image.onload = function () {
        const width = image.width; // Get the width of the image
        const height = image.height; // Get the height of the image

        const { rect, media } = createObjectGroup(
          image,
          width,
          height,
          selectedObj,
          "contain"
        );
        multiMediaObjectFit(canvas, rect, media, "contain");

        // Group the selected object with the fabric.Image object
        const group = new fabric.Group([rect, media], groupOptions);
        group.set("angle", selectedObj.angle);

        // Add the image to the canvas
        canvas.add(group);
        canvas.renderAll();
      };

      image.src = fileData;
    } else if (file.type.split("/")[0] == "video") {
      const videoElement = document.createElement("video");

      const container = document.querySelector(".designatedArea");
      container.appendChild(videoElement);

      const onCanPlayThrough = async () => {
        // Get the video's width and height
        const width = videoElement.videoWidth;
        const height = videoElement.videoHeight;

        // Set the video's width and height attributes
        videoElement.width = width;
        videoElement.height = height;

        const groupOptions = {
          left: selectedObj.left,
          top: selectedObj.top,
          width: selectedObj.width,
          height: selectedObj.height,
          objectCaching: false,
          type: "Multimedia",
          originX: "left",
          originY: "top",
          transformOrigin: "left top",
          id: uuid(),
          superType: "Multimedia",
        };

        const imageData = getThumbnailFromCanvas(width, height, videoElement);

        fabric.Image.fromURL(imageData, (image) => {
          const rect = new fabric.Rect({
            originX: "center",
            originY: "center",
            left: selectedObj.left,
            top: selectedObj.top,
            width: selectedObj.width,
            height: selectedObj.height,
            fill: selectedObj.fill,
            stroke: selectedObj.stroke,
            strokeWidth: selectedObj.strokeWidth,
            objectCaching: false,
          });
          image.set({
            left: selectedObj.left,
            top: selectedObj.top,
            width: width,
            height: height,
            objectCaching: false,
            selected: false,
            originX: "center",
            originY: "center",
            objectFit: "contain",
          });
          multiMediaObjectFit(canvas, rect, image, "contain");

          // Group the selected object with the fabric.Image object
          const group = new fabric.Group([rect, image], groupOptions);
          group.set("angle", selectedObj.angle);

          // Remove the event listener after capturing the image and rendering the canvas
          videoElement.removeEventListener("canplaythrough", onCanPlayThrough);

          container.removeChild(videoElement);
          canvas.add(group);
          canvas.renderAll();
        });
      };

      videoElement.src = fileData;

      videoElement.addEventListener("canplaythrough", onCanPlayThrough);
    }
  };
  const addMedia = (items: any[], selectedObj = undefined) => {
    const itemForPreview = items[0];
    const isValidFile = itemForPreview?.isFile && itemForPreview.contentType;
    const isImage =
      isValidFile && itemForPreview.contentType.startsWith("image");
    const isHTMLVideoType =
      isValidFile &&
      ["video/mp4", "video/webm", "video/ogg", "video"].includes(
        itemForPreview.contentType
      );

    let srcUrl = "";
    if (isImage) {
      loadImageElement(srcUrl, selectedObj, "contain", null, canvas, "");
    } else if (isHTMLVideoType) {
      loadVideoThumbnail(srcUrl, selectedObj, "contain", null, canvas, "");
    }
  };

  return {
    addMedia,
    addDroppedMediaFromPC,
  };
};

export default useMultiMediaHandlers;
