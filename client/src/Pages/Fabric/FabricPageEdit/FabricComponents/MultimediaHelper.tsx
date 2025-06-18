import React from "react";
import { fabric } from "fabric";
import { v4 as uuid } from "uuid";
import { renderToString } from "react-dom/server";
import PlayVideoSVG from "./images/PlayVideoSVG";
import EmptyImage from "./images/draft_picture.png";
import PlaylistIconSvg from "./images/PlaylistIconSvg";

const cropUrl = (url) => {
  let temp = url.split("?")[0];
  temp = temp.split("/");
  temp = temp.slice(3, temp.length).join("/");
  return temp;
};

export const getThumbnailFromCanvas = (width, height, element) => {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.style.display = "none";

  const context = tempCanvas.getContext("2d");
  // Set tempCanvas dimensions to match the video size
  tempCanvas.width = width;
  tempCanvas.height = height;

  // Draw the current frame of the video onto the canvas
  context.drawImage(element, 0, 0, tempCanvas.width, tempCanvas.height);

  // Get the image data from the canvas
  const imageData = tempCanvas.toDataURL();
  return imageData;
};

const addCircleBar = (objectGroup, canvas) => {
  const circleRadius = 30;
  const strokeWidth = 10;

  // Calculate the position to center the circle within the rectangle
  const circleLeft = objectGroup.left + objectGroup.width / 2;
  const circleTop = objectGroup.top + objectGroup.height / 2;

  const groupOptions = {
    left: objectGroup.left,
    top: objectGroup.top,
    width: objectGroup.width,
    height: objectGroup.height,
    objectCaching: false,
    originX: "left",
    originY: "top",
    transformOrigin: "left top",
    selectable: false, // Disable selection
    evented: false, // Disable events
  };

  const progressCircle = new fabric.Circle({
    left: circleLeft,
    top: circleTop,
    radius: circleRadius,
    startAngle: 0, // Start at the top
    endAngle: -90, // Initial end angle also at the top
    fill: "transparent",
    stroke: "#f00",
    strokeWidth: strokeWidth,
    originX: "center",
    originY: "center",
    selectable: false, // Disable selection
    evented: false, // Disable events
  });

  const rect = new fabric.Rect({
    originX: "left",
    originY: "top",
    left: objectGroup.left,
    top: objectGroup.top,
    width: objectGroup.width,
    height: objectGroup.height,
    fill: "#FFFFFF",
    stroke: "#000000",
    strokeWidth: objectGroup.strokeWidth,
    objectCaching: false,
  });

  const group = new fabric.Group([rect, progressCircle], groupOptions);

  canvas.add(group);

  let angle = 0;

  const animateSpin = () => {
    angle += 7; // Adjust rotation speed as needed
    progressCircle.set({ angle: angle });
    progressCircle.setCoords();
    canvas.renderAll();
    requestAnimationFrame(animateSpin);
  };

  requestAnimationFrame(animateSpin); // Start the animation loop
  return group;
};

export const createObjectGroup = (
  element,
  width,
  height,
  objectGroup,
  objectFit
) => {
  const media = new fabric.Image(element, {
    left: objectGroup.left,
    top: objectGroup.top,
    width: width,
    height: height,
    objectCaching: false,
    selected: false,
    originX: "center",
    originY: "center",
    objectFit: objectFit,
  });

  const rect = new fabric.Rect({
    originX: "center",
    originY: "center",
    left: objectGroup.left,
    top: objectGroup.top,
    width: objectGroup.width,
    height: objectGroup.height,
    fill: objectGroup.fill || "#FFFFFFFF",
    stroke: objectGroup.stroke || "#FFFFFFFF",
    strokeWidth: objectGroup.stroke ? objectGroup.strokeWidth : null,
    objectCaching: false,
  });
  return {
    media,
    rect,
  };
};
export const createElement = (srcUrl, tag, objectFit) => {
  if (tag == "video") {
    const videoElement = document.createElement("video");
    videoElement.style.width = "100%";
    videoElement.style.marginTop = "150px";
    videoElement.style.height = "100%";
    videoElement.style.objectFit = objectFit;
    videoElement.muted = true;
    videoElement.src = srcUrl;
    videoElement.autoplay = true;
    videoElement.loop = true;
    videoElement.controls = false;
    videoElement.playsInline = true;
    videoElement.crossOrigin = "anonymous";
    return videoElement;
  } else {
    const imageElement = document.createElement("img");
    imageElement.style.width = "100%";
    imageElement.style.height = "100%";
    imageElement.style.objectFit = objectFit;
    imageElement.src = srcUrl;
    imageElement.crossOrigin = "anonymous";
    return imageElement;
  }
};

export const multiMediaObjectFit = (
  canvas,
  backgroundRect,
  media,
  objectFit
) => {
  if (objectFit == "contain") {
    // Calculate the scaling factor for width and height
    const scaleX = backgroundRect.width / media.width;
    const scaleY = backgroundRect.height / media.height;

    // Determine the smaller scaling factor to maintain aspect ratio
    const scale = Math.min(scaleX, scaleY);
    media.set({
      scaleX: scale,
      scaleY: scale,
      clipPath: null,
    });
  } else if (objectFit == "fill") {
    const scaleX = backgroundRect.width / media.width;
    const scaleY = backgroundRect.height / media.height;
    media.set({
      scaleX: scaleX,
      scaleY: scaleY,
      clipPath: null,
    });
  } else {
    const imageAspect = media.width / media.height;

    // calculate the aspect ratio of the group
    const groupAspect = backgroundRect.width / backgroundRect.height;

    // set the scale of the image based on its aspect ratio and the group's aspect ratio
    if (imageAspect >= groupAspect) {
      const newScaleY = backgroundRect.height / media.height;
      media.set({
        scaleX: newScaleY,
        scaleY: newScaleY,
        objectFit: "cover",
      });
    } else {
      const newScaleX = backgroundRect.width / media.width;
      media.set({
        scaleX: newScaleX,
        scaleY: newScaleX,
        objectFit: "cover",
      });
    }

    const rectScaleX =
      backgroundRect.width / (backgroundRect.width * media.scaleX);
    const rectScaleY =
      backgroundRect.height / (backgroundRect.height * media.scaleY);
    media.set(
      "clipPath",
      new fabric.Rect({
        ...backgroundRect,
        top: 0,
        left: 0,
        scaleX: rectScaleX,
        scaleY: rectScaleY,
      })
    );
  }
  canvas.renderAll();
};

export const loadVideoThumbnail = async (
  srcUrl,
  objectGroup,
  objectFitValue,
  indexOfConfiguration,
  canvas,
  playlistID?: string
) => {
  return new Promise<void>((resolve) => {
    const objectFit = objectFitValue ? objectFitValue : "contain";
    const videoElement = createElement(srcUrl, "video", objectFit);
    const url = cropUrl(srcUrl);
    const container = document.querySelector(".editPage");
    container.appendChild(videoElement);

    const loadingImageObj = addCircleBar(objectGroup, canvas);

    const onCanPlayThrough = async () => {
      // Get the video's width and height
      const width = (videoElement as HTMLVideoElement).videoWidth;
      const height = (videoElement as HTMLVideoElement).videoHeight;

      // Set the video's width and height attributes
      videoElement.width = width;
      videoElement.height = height;

      const groupOptions = {
        left: objectGroup.left,
        top: objectGroup.top,
        width: objectGroup.width,
        height: objectGroup.height,
        objectCaching: false,
        type: "Multimedia",
        originX: "left",
        originY: "top",
        transformOrigin: "left top",
        id: uuid(),
        superType: "Multimedia",
        name: "Multimedia",
      };

      const imageData = getThumbnailFromCanvas(width, height, videoElement);

      const svgString = playlistID
        ? renderToString(
            <PlaylistIconSvg height="48px" width="48px" fill="#c3c3c3" />
          )
        : renderToString(
            <PlayVideoSVG height="48px" width="48px" fill="#c3c3c3" />
          );

      fabric.loadSVGFromString(svgString, (objects, options) => {
        const svg = fabric.util.groupSVGElements(objects, options);
        // Position SVG at the bottom left
        svg.set({
          left: objectGroup.left,
          top: objectGroup.top,
          originX: "center",
          originY: "center",
        });

        fabric.Image.fromURL(imageData, (image) => {
          const rect = new fabric.Rect({
            originX: "center",
            originY: "center",
            left: objectGroup.left,
            top: objectGroup.top,
            width: objectGroup.width,
            height: objectGroup.height,
            fill: objectGroup.fill,
            stroke: objectGroup.stroke,
            strokeWidth: objectGroup.strokeWidth,
            objectCaching: false,
          });
          image.set({
            left: objectGroup.left,
            top: objectGroup.top,
            width: width,
            height: height,
            objectCaching: false,
            selected: false,
            originX: "center",
            originY: "center",
            objectFit: objectFit,
          });
          multiMediaObjectFit(canvas, rect, image, objectFit);

          // Group the selected object with the fabric.Image object
          const group = new fabric.Group([rect, image, svg], groupOptions);
          group.set("settings", {
            path: playlistID ? playlistID : url,
            mediaType: playlistID ? "playlist" : "video",
            objectFit: objectFit,
          });
          group.set("angle", objectGroup.angle);

          const objects = canvas.getObjects();
          let indexToInsert;
          if (indexOfConfiguration) indexToInsert = indexOfConfiguration;
          else {
            indexToInsert = objects.indexOf(objectGroup);
          }

          // Remove the event listener after capturing the image and rendering the canvas
          videoElement.removeEventListener("canplaythrough", onCanPlayThrough);

          container.removeChild(videoElement);
          canvas.remove(objectGroup);
          canvas.remove(loadingImageObj);

          for (let i = objects.length - 1; i >= 0; i--) {
            if (objects[i].type !== "addMediaArea") {
              indexToInsert = i; // Store the index of the last non-"addMediaArea" object
              break; // Stop iterating when a non-"addMediaArea" object is found
            }
          }

          canvas.insertAt(group, indexToInsert);
          canvas.renderAll();
          resolve();
        });
      });

      // Don't forget to remove the video and canvas elements when the component unmounts
    };
    // Wait for the video to load its metadata before getting its dimensions
    videoElement.addEventListener("canplaythrough", onCanPlayThrough);
  });
};

export const loadVideoElement = (
  srcUrl,
  objectGroup,
  objectFitValue,
  indexOfConfiguration,
  canvas
) => {
  const objectFit = objectFitValue ? objectFitValue : "contain";
  const videoElement = createElement(srcUrl, "video", objectFit);
  const url = cropUrl(srcUrl);
  // Wait for the video to load its metadata before getting its dimensions
  videoElement.addEventListener("loadedmetadata", function () {
    // Get the video's width and height
    const width = (videoElement as HTMLVideoElement).videoWidth;
    const height = (videoElement as HTMLVideoElement).videoHeight;

    // Set the video's width and height attributes
    videoElement.width = width;
    videoElement.height = height;
    const groupOptions = {
      left: objectGroup.left,
      top: objectGroup.top,
      width: objectGroup.width,
      height: objectGroup.height,
      fill: objectGroup.fill,
      stroke: objectGroup.stroke,
      strokeWidth: objectGroup.strokeWidth,
      objectCaching: false,
      type: "Multimedia",
      originX: "left",
      originY: "top",
      transformOrigin: "left top",
      id: uuid(),
    };

    const { media, rect } = createObjectGroup(
      videoElement,
      width,
      height,
      objectGroup,
      objectFit
    );

    multiMediaObjectFit(canvas, rect, media, objectFit);

    // Group the selected object with the fabric.Image object
    const group = new fabric.Group([rect, media], groupOptions);
    group.set({ path: url, mediaType: "video", angle: objectGroup.angle });

    let indexToInsert;
    if (indexOfConfiguration) indexToInsert = indexOfConfiguration;
    else {
      const objects = canvas.getObjects();
      indexToInsert = objects.indexOf(objectGroup);
    }

    canvas.remove(objectGroup);
    canvas.insertAt(group, indexToInsert);
    // canvas.setActiveObject(group);

    media.getElement().play();

    // Continuously redraw the canvas to make the video playable
    const VideoAnimation = () => {
      const objects = group.getObjects();
      const backgroundRect = objects[0];
      const media = objects[1];
      multiMediaObjectFit(canvas, backgroundRect, media, media.objectFit);
      canvas.renderAll();
      fabric.util.requestAnimFrame(VideoAnimation);
    };

    VideoAnimation();
  });
};

export const loadImageElement = async (
  srcUrl,
  objectGroup,
  objectFitValue,
  indexOfConfiguration,
  canvas,
  playlistID?: string
) => {
  return new Promise<void>((resolve) => {
    const objectFit = objectFitValue ? objectFitValue : "contain";
    const imageElement = createElement(srcUrl, "img", objectFit);

    const loadingImageObj = addCircleBar(objectGroup, canvas);
    const svgString = playlistID
      ? renderToString(
          <PlaylistIconSvg height="48px" width="48px" fill="#c3c3c3" />
        )
      : renderToString(
          <></>
          // <LibraryPictureIcon height="48px" width="48px" fill="#c3c3c3" />
        );

    fabric.loadSVGFromString(svgString, (objects, options) => {
      const svg = fabric.util.groupSVGElements(objects, options);
      // Position SVG at the bottom left
      svg.set({
        left: objectGroup.left,
        top: objectGroup.top,
        originX: "center",
        originY: "center",
      });
      // Add load event listener
      imageElement.addEventListener("load", function () {
        const width = (imageElement as HTMLImageElement).naturalWidth;
        const height = (imageElement as HTMLImageElement).naturalHeight;

        // Set the video's width and height attributes
        imageElement.width = width;
        imageElement.height = height;

        const groupOptions = {
          left: objectGroup.left,
          top: objectGroup.top,
          width: objectGroup.width,
          height: objectGroup.height,
          stroke: objectGroup.stroke,
          fill: objectGroup.fill,
          strokeWidth: objectGroup.strokeWidth,
          objectCaching: false,
          type: "Multimedia",
          originX: "left",
          originY: "top",
          transformOrigin: "left top",
          id: uuid(),
          superType: "Multimedia",
          name: "Multimedia",
        };
        const { media, rect } = createObjectGroup(
          imageElement,
          width,
          height,
          objectGroup,
          objectFit
        );
        const url = cropUrl(srcUrl);
        multiMediaObjectFit(canvas, rect, media, objectFit);
        // Group the selected object with the fabric.Image object
        const group =
          playlistID !== ""
            ? new fabric.Group([rect, media, svg], groupOptions)
            : new fabric.Group([rect, media], groupOptions);
        group.set("settings", {
          path: playlistID ? playlistID : url,
          mediaType: !!playlistID && playlistID !== "" ? "playlist" : "image",
          objectFit: objectFit,
        });
        group.set("angle", objectGroup.angle);

        const objects = canvas.getObjects();
        let indexToInsert;
        if (indexOfConfiguration) indexToInsert = indexOfConfiguration;
        else {
          indexToInsert = objects.indexOf(objectGroup);
        }

        canvas.remove(objectGroup);
        canvas.remove(loadingImageObj);

        for (let i = objects.length - 1; i >= 0; i--) {
          if (objects[i].type !== "addMediaArea") {
            indexToInsert = i; // Store the index of the last non-"addMediaArea" object
            break; // Stop iterating when a non-"addMediaArea" object is found
          }
        }

        canvas.insertAt(group, indexToInsert);
        // canvas.setActiveObject(group);
        canvas.renderAll();
        resolve();
      });
    });
  });
};

export const loadEmptyImage = (
  playlistID,
  objectGroup,
  objectFitValue,
  indexOfConfiguration,
  canvas
) => {
  const objectFit = objectFitValue ? objectFitValue : "contain";
  const loadingImageObj = addCircleBar(objectGroup, canvas);

  fabric.Image.fromURL(EmptyImage, (img) => {
    const width = img._originalElement.naturakWidth;
    const height = img._originalElement.naturalHeight;

    const groupOptions = {
      left: objectGroup.left,
      top: objectGroup.top,
      width: objectGroup.width,
      height: objectGroup.height,
      stroke: objectGroup.stroke,
      fill: objectGroup.fill,
      strokeWidth: objectGroup.strokeWidth,
      objectCaching: false,
      type: "Multimedia",
      originX: "left",
      originY: "top",
      transformOrigin: "left top",
      id: uuid(),
      superType: "Multimedia",
      name: "Multimedia",
    };
    const { media, rect } = createObjectGroup(
      img._originalElement,
      width,
      height,
      objectGroup,
      objectFit
    );

    multiMediaObjectFit(canvas, rect, media, objectFit);
    // Group the selected object with the fabric.Image object
    const group = new fabric.Group([rect, media], groupOptions);
    group.set("settings", {
      mediaType: "playlist",
      path: playlistID,
      objectFit: objectFit,
    });
    group.set("angle", objectGroup.angle);

    const objects = canvas.getObjects();
    let indexToInsert;
    if (indexOfConfiguration) indexToInsert = indexOfConfiguration;
    else {
      indexToInsert = objects.indexOf(objectGroup);
    }

    canvas.remove(objectGroup);
    canvas.remove(loadingImageObj);

    for (let i = objects.length - 1; i >= 0; i--) {
      if (objects[i].type !== "addMediaArea") {
        indexToInsert = i; // Store the index of the last non-"addMediaArea" object
        break; // Stop iterating when a non-"addMediaArea" object is found
      }
    }

    canvas.insertAt(group, indexToInsert);
    // canvas.setActiveObject(group);
    canvas.renderAll();
  });
};
