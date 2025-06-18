import React, { useEffect, useRef } from "react";
import { Multimedia as MultimediaType } from "@client/schemas/schemaDesigner";
import PlaylistController, {
  PlaylistItem,
  Playlist as PlaylistModel,
} from "../../controllers/playlistController";

const Playlist = ({
  config,
  item,
}: {
  config: MultimediaType;
  item: { ForeignItemID: string } | null;
}) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!item) return;
    const controller = new PlaylistController({
      noMediaToShow() {},
      onPlaylistEnd() {},
      playItem(item) {
        if (item.Type === "Image") {
          if (imageRef.current) {
            imageRef.current.src = item.FilePath;
            imageRef.current.style.display = "block";
          }
          if (videoRef.current) videoRef.current.style.display = "none";
        } else if (item.Type === "Video") {
          if (videoRef.current) {
            videoRef.current.src = item.FilePath;
            videoRef.current.load();
            videoRef.current.play();
            videoRef.current.style.display = "block";
          }
          if (imageRef.current) imageRef.current.style.display = "none";
        } else {
          if (imageRef.current) imageRef.current.style.display = "none";
          if (videoRef.current) videoRef.current.style.display = "none";
        }
      },
      playlistItemError() {},
    });
    const playlist = new PlaylistModel(item.ForeignItemID);
    const playlistItems = window.pmJsLib.getItemsOfPlaylist(item.ForeignItemID);
    playlist.PlaylistItems = JSON.parse(playlistItems || "[]").map(
      (item: any) =>
        new PlaylistItem(
          item.Type,
          item.ForeignItemID,
          item.Duration,
          item.Repeat,
          item.Schedule,
          item.StartDate ? new Date(item.StartDate) : null,
          item.FinishDate ? new Date(item.FinishDate) : null,
          item.FilePath,
          item.VideoDuration
        )
    );
    controller.init(playlist, [playlist], true, false);
    controller.start(playlist);
    return () => controller.destroy();
  }, [item]);

  return (
    <>
      <img
        ref={imageRef}
        style={{
          width: "100%",
          height: "100%",
          objectFit: config.settings?.objectFit,
          position: "absolute",
        }}
        alt=""
      />
      <video
        ref={videoRef}
        style={{
          width: "100%",
          height: "100%",
          objectFit: config.settings?.objectFit,
          position: "absolute",
        }}
        // Transparent poster
        poster="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        autoPlay
        muted
      />
    </>
  );
};

export default Playlist;
