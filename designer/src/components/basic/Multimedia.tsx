import React, { useMemo } from "react";
import { Multimedia as MultimediaType } from "@client/schemas/schemaDesigner";
import { configToStyle } from "../../utils/styleUtils";
import Playlist from "./Playlist";

type MultimediaProps = { config: MultimediaType };

const Multimedia = ({ config }: MultimediaProps) => {
  const style = configToStyle(config);

  const item = useMemo(() => {
    const json = window.pmJsLib.getSupportingPlaylistItems();
    const allItems: {
      Name: string;
      FilePath: string;
      ForeignItemID: string;
      Type: string;
    }[] = JSON.parse(json || "[]");
    return (
      allItems.find((item) => {
        if (config.settings?.mediaType === "playlist")
          return (
            item.Type === "Playlist" &&
            item.ForeignItemID?.toUpperCase?.() === config.settings.path
          );
        const split = (config.settings?.path || "").split("/");
        if (split.length === 0) return false;
        const fileName = split[split.length - 1];
        return fileName === item.Name;
        // TODO Hash
      }) || null
    );
  }, [config.settings?.path, config.settings?.mediaType]);

  return (
    <div style={style}>
      {config.settings?.mediaType === "image" ? (
        <img
          style={{
            width: "100%",
            height: "100%",
            objectFit: config.settings?.objectFit,
          }}
          src={item?.FilePath}
          alt=""
        />
      ) : config.settings?.mediaType === "video" ? (
        <video
          style={{
            width: "100%",
            height: "100%",
            objectFit: config.settings?.objectFit,
          }}
          autoPlay
          muted
          loop
          // Transparent poster
          poster="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
          src={item?.FilePath}
        />
      ) : (
        <Playlist config={config} item={item} />
      )}
    </div>
  );
};

export default Multimedia;
