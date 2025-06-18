interface PmJsLib {
  /** Parsable as Record<string, string> */
  getLabels(): string;
  /** Parsable as Record<string, string> */
  getVideos(): string;
  /** Parsable as {...}[] */
  getSupportingPlaylistItems(): string | null;
  /** Parsable as {...}[] */
  getItemsOfPlaylist(playlistID: string): string | null;
  /** Parsable as { deviceID: string; branchID: string } */
  getDeviceBranchInfo(): string;
  tryMeBtn?(): void;
}

declare interface Window {
  pmJsLib: PmJsLib;
}
