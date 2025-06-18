import { stringToArray, getSchedule } from "cron-converter";
import moment from "moment";

export class PlaylistItem {
  SeekTime?: number;

  constructor(
    public Type: string,
    public ForeignItemID: string | null,
    public Duration: number | null,
    public Repeat: number,
    public Schedule: string | null,
    public StartDate: Date | null,
    public FinishDate: Date | null,
    public FilePath: string,
    public VideoDuration: number | null
  ) {}

  getFileName() {
    return "todo";
  }
  getForeignItemID() {
    return "todo";
  }
  isAfterStart() {
    return this.StartDate ? moment().isAfter(this.StartDate) : true;
  }
  isBeforeFinish() {
    return this.FinishDate ? moment().isBefore(this.FinishDate) : true;
  }
  isWithinRange() {
    return this.isAfterStart() && this.isBeforeFinish();
  }
  getDurationOrDefault(includeVideoDuration?: boolean) {
    if (
      includeVideoDuration &&
      this.Type === "Video" &&
      !this.Duration &&
      this.VideoDuration
    )
      return this.VideoDuration;
    else if (this.Duration && ["Image", "Html", "Url"].includes(this.Type))
      return 10000;
    else return this.Duration || 10000;
  }
}

export class Playlist {
  PlaylistItems: PlaylistItem[] = [];

  constructor(public ID: string) {}

  getNonSupportingItems() {
    return this.PlaylistItems;
  }
  getNonScheduledNonSupportingItems() {
    return this.PlaylistItems.filter((item) => !item.Schedule);
  }
}

type ShowMeControllerCallbackInterface = {
  playItem(item: PlaylistItem): void;
  playlistItemError(): void;
  onPlaylistEnd(): void;
  noMediaToShow(): void;
};
const TrueTime = {
  now() {
    return new Date();
  },
};

class PlaylistState {
  /**
   * Index of item currently playing. -1 means none
   */
  public currentIndex = -1;
  /**
   * Which iteration of its repeats the current item is on. 0 means none, 1 means first iteration etc.
   */
  public currentRepeat = 0;
  /**
   * State of nested playlist if current item is a playlist, otherwise null
   */
  public nestedPlaylistState: PlaylistState | null = null;

  constructor(
    currentIndex?: number,
    currentRepeat?: number,
    nestedPlaylistState?: PlaylistState | null
  ) {
    if (currentIndex !== undefined) this.currentIndex = currentIndex;
    if (currentRepeat !== undefined) this.currentRepeat = currentRepeat;
    if (nestedPlaylistState !== undefined && nestedPlaylistState !== null)
      this.nestedPlaylistState = nestedPlaylistState;
  }

  clone() {
    const newState: PlaylistState = new PlaylistState(
      this.currentIndex,
      this.currentRepeat,
      this.nestedPlaylistState?.clone()
    );
    return newState;
  }
}

class ScheduledItemInfo {
  public constructor(
    public scheduledTime: Date,
    public scheduledItemState: PlaylistState
  ) {}
}

class PlaylistController {
  //@ts-ignore
  public playlist: Playlist;
  private allPlaylists: Playlist[] = [];
  private loopMainPlaylist = false;
  private ntpSync = false;
  private playlistDuration = 0;
  /**
   * Temporary variable used when calculating position using NTP sync
   */
  private cumulativeDuration = 0;
  private isPaused = false;
  /**
   * Current state that reflects the item currently playing, or last played if paused. Could also
   * correspond to a scheduled item.
   */
  private playlistState = new PlaylistState();
  /**
   * State of normal flow to return to, once scheduled items have finished. Should never
   * correspond to scheduled items.
   */
  private backupPlaylistState = new PlaylistState();
  /**
   * State of next scheduled item to play when the time comes
   */
  private nextScheduledState: PlaylistState | null = null;
  private nextItemHandler: NodeJS.Timeout | null = null;
  private scheduledItemHandler: NodeJS.Timeout | null = null;
  //    private ScheduledPlaylistItemReceiver notificationsReceiver;
  private callback: ShowMeControllerCallbackInterface;

  public constructor(callback: ShowMeControllerCallbackInterface) {
    this.callback = callback;
  }

  public init(
    playlist: Playlist,
    allPlaylists: Playlist[],
    loop?: boolean,
    ntpSync?: boolean
  ) {
    this.destroy();
    this.playlist = playlist;
    this.allPlaylists = allPlaylists;
    this.loopMainPlaylist = loop || false;
    this.ntpSync = ntpSync || false;
    if (ntpSync) {
      this.playlistDuration = this.getPlaylistDuration(playlist);
    }
  }

  /**
   * Stops playback and resets state
   */
  public destroy() {
    this.pause();
    this.playlistState = new PlaylistState();
    this.backupPlaylistState = new PlaylistState();
  }

  /**
   * Starts playback if not already started. If provided playlist is different then init is called.
   */
  public start(playlist?: Playlist, loop?: boolean) {
    if (playlist && playlist.ID !== this.playlist.ID)
      this.init(playlist, this.allPlaylists, loop, this.ntpSync);
    if (this.isPaused) {
      this.isPaused = false;
      this.playNextItem(false);
      this.initScheduledItems();
    }
  }

  /**
   * Stops playback without resetting state
   */
  public pause() {
    this.isPaused = true;
    if (this.nextItemHandler) clearTimeout(this.nextItemHandler);
    this.nextItemHandler = null;
    this.cancelScheduledItems();
  }

  /**
   * Plays next item in playlist. Also starts a timer to call this method again once the item's
   * duration comes to an end (if the item has a non-null duration). If previousItemError is true
   * and there are no other items left to play, then calls callback.playlistItemError().
   */
  public playNextItem(previousItemError: boolean) {
    // Remove callbacks, in case this method is called externally.
    if (this.nextItemHandler) clearTimeout(this.nextItemHandler);
    this.nextItemHandler = null;
    if (this.isPaused) {
      return;
    }

    // Get next state and play item if exists
    let newState = this.getNextState(
      this.playlist,
      this.playlistState,
      this.loopMainPlaylist
    );
    if (
      this.isScheduledRecursive(this.playlist, this.playlistState) &&
      newState == null &&
      this.backupPlaylistState
    ) {
      // Scheduled item has finished, so return to normal flow
      newState = this.getNextState(
        this.playlist,
        this.backupPlaylistState,
        this.loopMainPlaylist
      );
      // Also set up next scheduled item
      this.initScheduledItems();
    }
    if (newState) {
      if (previousItemError) {
        // Check if the new state corresponds to the same item that failed previously
        const previousItem = this.getItemFromState(
          this.playlist,
          this.playlistState
        );
        const newItem = this.getItemFromState(this.playlist, newState);
        if (
          previousItem &&
          newItem &&
          previousItem.getFileName() === newItem.getFileName()
        ) {
          this.callback.playlistItemError();
          return;
        }
      }
      this.playItemFromState(newState);
    } else if (!this.loopMainPlaylist) this.callback.onPlaylistEnd();
    else if (previousItemError) this.callback.playlistItemError();
    else this.callback.noMediaToShow();
  }

  /**
   * Get item based on new state, and if the item exists then call callback.playItem().
   * Then sets a timer to go to the next item. Sets this.playlistState if an item is found.
   */
  private playItemFromState(state: PlaylistState) {
    if (this.nextItemHandler) clearTimeout(this.nextItemHandler);
    this.nextItemHandler = null;
    if (this.isPaused) {
      return;
    }

    const currentItem = this.getItemFromState(this.playlist, state);
    if (currentItem) {
      this.playlistState = state;
      this.callback.playItem(currentItem);

      // Set timer if the item has a duration and if it's not the only item in the playlist
      const duration = currentItem.getDurationOrDefault(true);
      if (duration && duration > 0)
        this.nextItemHandler = setTimeout(
          () => this.playNextItem(false),
          duration
        );
    }
  }

  /**
   * Returns a playlist from allPlaylists given its ID.
   */
  private getPlaylistByID(playlistID: string | null) {
    return this.allPlaylists.find((item) => item.ID === playlistID) || null;
  }

  /**
   * Initializes a state given a playlist item. If the item shouldn't be played, the function
   * returns null. This can happen if the current time isn't within the item's start/finish
   * range, or if the item is a playlist with no items to play. If there is an item to play,
   * the function returns a PlaylistState with the given index and repeat, and with the nested
   * state set correctly.
   */
  private initializeState(
    currentIndex: number,
    currentRepeat: number,
    item: PlaylistItem,
    skipStartFinishChecks?: boolean
  ) {
    if ((!skipStartFinishChecks && !item.isWithinRange()) || item.Repeat < 1)
      return null;
    if (item.Type === "Playlist") {
      const nestedPlaylist = this.getPlaylistByID(item.ForeignItemID);
      const nestedState = this.getNextState(
        nestedPlaylist,
        new PlaylistState(),
        false
      );
      if (nestedState == null) return null;
      else return new PlaylistState(currentIndex, currentRepeat, nestedState);
    }
    return new PlaylistState(currentIndex, currentRepeat, null);
  }

  /**
   * Returns the next state to play, given the current state. Runs recursively through all nested
   * items if present. If loop is false and there are no more items to play, then returns null.
   * If loop is true, then loops back to the start of the playlist. Also returns null if the
   * playlist has no items between StartDate and FinishDate. If the previous state corresponds to
   * a scheduled item or sub-item, then the returned state will be null, unless there are multiple
   * repeats or the item is a playlist with more items to play.
   */
  private getNextState(
    playlist: Playlist | null,
    previousState: PlaylistState,
    loop: boolean
  ): PlaylistState | null {
    if (playlist == null) return null;
    const playlistItems = playlist.getNonSupportingItems();
    if (playlistItems.length === 0) return null;

    let newState: PlaylistState | null;
    const previousItem = playlistItems[previousState.currentIndex] || null;
    if (previousState && previousItem) {
      // If the previous item is a playlist, check if it has more items to play
      if (previousItem.Type === "Playlist") {
        const nestedPlaylist = this.getPlaylistByID(
          previousItem.getForeignItemID()
        );
        const nestedState = previousState.nestedPlaylistState
          ? this.getNextState(
              nestedPlaylist,
              previousState.nestedPlaylistState,
              false
            )
          : null;
        // If nestedState is not null, then the nested playlist has at least one item left
        if (nestedState) {
          newState = new PlaylistState(
            previousState.currentIndex,
            previousState.currentRepeat,
            nestedState
          );
          return newState;
        }
      }
      // Check if previous item has more repeats left
      if (previousItem.Repeat > previousState.currentRepeat) {
        newState = this.initializeState(
          previousState.currentIndex,
          previousState.currentRepeat + 1,
          previousItem
        );
        if (newState) return newState;
      }
      // If the previous item was scheduled but has no more sub-items or repeats left, then
      // return null
      if (this.isScheduledRecursive(playlist, previousState)) return null;
    }
    // Iterate through all playlist items, starting at the previous index plus 1, and looping
    // back round to the first item if necessary using modulo
    for (let i = 0; i < playlistItems.length; i++) {
      // If loop is false and there are no more valid items without looping, return null
      if (!loop && i + previousState.currentIndex + 1 >= playlistItems.length)
        return null;
      const candidateIndex =
        (i + previousState.currentIndex + 1) % playlistItems.length;
      const playlistItemCandidate = playlistItems[candidateIndex];
      // Scheduled items are ignored here
      if (playlistItemCandidate.Schedule) continue;
      newState = this.initializeState(candidateIndex, 1, playlistItemCandidate);
      if (newState) return newState;
    }
    return null;
  }

  /**
   * Returns the item to play, given a state object. Runs recursively through nested playlists
   * if necessary, to find the current nested item.
   */
  private getItemFromState(
    playlist: Playlist,
    state: PlaylistState
  ): PlaylistItem | null {
    const playlistItems = playlist.getNonSupportingItems();
    const currentItem = playlistItems[state.currentIndex] || null;
    if (currentItem == null) return null;
    if (currentItem.Type === "Playlist") {
      if (state.nestedPlaylistState) {
        const subPlaylist = this.getPlaylistByID(
          currentItem.getForeignItemID()
        );
        if (!subPlaylist) return null;
        return this.getItemFromState(subPlaylist, state.nestedPlaylistState);
      } else return null;
    }
    return currentItem;
  }

  /**
   * Returns true if the state corresponds to a scheduled item, or an item of a scheduled
   * nested playlist, ie. if the item is not in the normal playlist flow.
   */
  private isScheduledRecursive(
    playlist: Playlist,
    state: PlaylistState
  ): boolean {
    const playlistItems = playlist.getNonSupportingItems();
    const item = playlistItems[state.currentIndex];
    if (item == null) return false;
    if (item.Schedule) return true;
    if (item.Type === "Playlist" && state.nestedPlaylistState) {
      const nestedPlaylist = this.getPlaylistByID(item.getForeignItemID());
      if (!nestedPlaylist) return false;
      return this.isScheduledRecursive(
        nestedPlaylist,
        state.nestedPlaylistState
      );
    }
    return false;
  }

  /**
   * Returns currently playing item of main or nested playlist. If in paused state, then returns
   * last played item.
   */
  public getCurrentItem() {
    return this.getItemFromState(this.playlist, this.playlistState);
  }

  /**
   * Returns the total duration of a playlist.
   */
  private getPlaylistDuration(playlist: Playlist | null) {
    if (playlist == null) return 0;
    const playlistItems: PlaylistItem[] =
      playlist.getNonScheduledNonSupportingItems();
    let result = 0;
    for (const item of playlistItems) {
      if (item.isWithinRange() && item.Repeat > 0) {
        if (item.Type === "Playlist") {
          const nestedPlaylist = this.getPlaylistByID(item.getForeignItemID());
          result += this.getPlaylistDuration(nestedPlaylist) * item.Repeat;
        } else result += item.getDurationOrDefault(true) * item.Repeat;
      }
    }
    return result;
  }

  /**
   * Get the item that should currently be playing, based on the duration of each item and the
   * true time clock. Sets SeekTime on the returned item.
   */
  private getItemNtpSync(playlist: Playlist) {
    const now = TrueTime.now().getTime();
    const targetPlaylistMs = (now + 3000) % this.playlistDuration;
    this.cumulativeDuration = 0;

    return this.getItemNtpSyncRecursive(playlist, targetPlaylistMs);
  }

  /**
   * Don't call directly, use getItemNtpSync instead. Used to recursively calculate the item
   * that should be playing, based on the duration of each item and the true time clock.
   */
  private getItemNtpSyncRecursive(
    playlist: Playlist,
    targetPlaylistMs: number
  ): PlaylistItem | null {
    const playlistItems = playlist.getNonScheduledNonSupportingItems();
    for (const item of playlistItems) {
      if (item.isWithinRange()) {
        for (let repeat = 0; repeat < item.Repeat; repeat++) {
          if (item.Type === "Playlist") {
            const nestedPlaylist = this.getPlaylistByID(
              item.getForeignItemID()
            );
            if (nestedPlaylist) {
              const found = this.getItemNtpSyncRecursive(
                nestedPlaylist,
                targetPlaylistMs
              );
              if (found) return found;
            }
          } else {
            this.cumulativeDuration += item.getDurationOrDefault(true);
            if (targetPlaylistMs < this.cumulativeDuration) {
              item.SeekTime =
                item.getDurationOrDefault(true) -
                (this.cumulativeDuration - targetPlaylistMs);
              return item;
            }
          }
        }
      }
    }
    // None found so return null
    return null;
  }

  /**
   * Finds next scheduled item and sets a runnable to play the item once ready, or immediately
   * if the item should already be playing.
   */
  private initScheduledItems() {
    this.cancelScheduledItems();
    const scheduledItemInfo = this.getNextScheduledItem(this.playlist);
    if (scheduledItemInfo) {
      const timeDiffInMillis =
        scheduledItemInfo.scheduledTime.getTime() - new Date().getTime();
      this.nextScheduledState = scheduledItemInfo.scheduledItemState;
      // If the time difference is positive then post a runnable, otherwise play immediately
      if (timeDiffInMillis > 0) {
        this.scheduledItemHandler = setTimeout(
          this.playScheduledItem.bind(this),
          timeDiffInMillis
        );
      } else {
        this.playScheduledItem();
      }
    }
  }

  /**
   * Cancels scheduled item runnable.
   */
  private cancelScheduledItems() {
    if (this.scheduledItemHandler) clearTimeout(this.scheduledItemHandler);
    this.scheduledItemHandler = null;
    this.nextScheduledState = null;
  }

  /**
   * Interrupts normal playlist flow to play a scheduled item, based on this.nextScheduledState
   */
  private playScheduledItem() {
    if (this.nextScheduledState) {
      this.backupPlaylistState = this.playlistState;
      this.playItemFromState(this.nextScheduledState);
    }
  }

  private transformCron(inputString: string | null) {
    if (inputString == null) return null;
    let split = inputString.split(" ");
    if (split.length !== 5) return null;
    if (split[2] === "*" && split[4] === "*") split[4] = "?";
    return "0 " + split.slice(0, 5).join(" ");
  }

  /**
   * Finds next scheduled item to play. Will also search recursively for scheduled items in
   * nested playlists. Works by subtracting the duration from the current time and using the cron
   * expression to calculate the next occurrence of the item. This means that the time returned
   * could be negative, if the item should currently be playing. If there is less than 1sec left
   * then the item will be ignored.
   */
  private getNextScheduledItem(playlist: Playlist) {
    let nextScheduledItemInfo: ScheduledItemInfo | null = null;

    const allItems = playlist.getNonSupportingItems();
    for (let index = 0; index < allItems.length; index++) {
      const item = allItems[index];
      if (item.Schedule == null || !item.isBeforeFinish() || item.Repeat < 1)
        continue;
      try {
        let from = moment();
        // If the StartDate is in the future, then the next valid time is calculated from this instead
        if (item.StartDate) {
          const startDate = item.StartDate;
          if (from.isBefore(startDate)) from = moment(startDate);
        }
        // Subtract item duration, in case item should currently be playing
        let itemDuration: number;
        if (item.Type === "Playlist")
          itemDuration =
            this.getPlaylistDuration(
              this.getPlaylistByID(item.getForeignItemID())
            ) * item.Repeat;
        else itemDuration = item.getDurationOrDefault(true) * item.Repeat;
        from = from.subtract(itemDuration, "milliseconds");
        // Subtract 1sec to make sure first time isn't skipped (cron works in 1sec increments)
        from = from.subtract(1, "seconds");

        // Get next valid time based on the Cron expression
        const fromAsDate = from.toDate();
        const cron = getSchedule(stringToArray(item.Schedule), fromAsDate);
        let nextValidTime = cron.next();
        // If there isn't much left to play, then ignore and find next occurrence
        if (nextValidTime.toMillis() - fromAsDate.getTime() <= 1000) {
          nextValidTime = cron.next();
        }
        if (
          nextScheduledItemInfo == null ||
          nextValidTime.toMillis() <
            nextScheduledItemInfo.scheduledTime.getTime()
        ) {
          const newScheduledItemState = this.initializeState(
            index,
            1,
            item,
            true
          );
          if (newScheduledItemState)
            nextScheduledItemInfo = new ScheduledItemInfo(
              nextValidTime.toJSDate(),
              newScheduledItemState
            );
        }
      } catch (ignored) {
        console.error(ignored);
      }
    }

    // Search for scheduled items in nested playlists
    for (let index = 0; index < allItems.length; index++) {
      const item = allItems[index];
      if (item.Type === "Playlist") {
        const nestedPlaylist = this.getPlaylistByID(item.getForeignItemID());
        if (nestedPlaylist) {
          const nestedScheduledItemInfo =
            this.getNextScheduledItem(nestedPlaylist);
          if (
            nestedScheduledItemInfo &&
            (nextScheduledItemInfo == null ||
              nestedScheduledItemInfo.scheduledTime.getTime() <
                nextScheduledItemInfo.scheduledTime.getTime())
          ) {
            const newScheduledItemState = new PlaylistState();
            newScheduledItemState.currentIndex = index;
            newScheduledItemState.currentRepeat = 1;
            newScheduledItemState.nestedPlaylistState =
              nestedScheduledItemInfo.scheduledItemState;
            nextScheduledItemInfo = nestedScheduledItemInfo;
          }
        }
      }
    }

    return nextScheduledItemInfo;
  }
}

export default PlaylistController;
