export class MusicPlayer {
  audioEl: HTMLAudioElement;
  progressEl: HTMLDivElement;
  pausePlayBtnEl: HTMLButtonElement;
  lyricSpans: NodeListOf<HTMLSpanElement> | null = null;

  updateProgressFn: () => void;
  handleLyricsUpdateFn: () => void;
  handleSeekFn: (e: MouseEvent) => void;

  // For efficient updates of classes
  currentLyricIndex = 0;

  constructor(
    public file: File,
    public lyricArr: [number, string][] | null = null
  ) {
    this.handleSeekFn = this.handleSeek.bind(this);
    this.updateProgressFn = this.updateProgress.bind(this);
    this.handleLyricsUpdateFn = this.handleLyricsUpdate.bind(this);

    this.audioEl = document.getElementById(
      "music-player-audio"
    ) as HTMLAudioElement;
    this.progressEl = document.querySelector(
      ".music-player__progress"
    ) as HTMLDivElement;

    this.audioEl.src = URL.createObjectURL(file);

    this.pausePlayBtnEl = document.getElementById(
      "play-pause-btn"
    ) as HTMLButtonElement;
    this.pausePlayBtnEl.addEventListener("click", () => {
      if (this.audioEl.paused) {
        this.pausePlayBtnEl.classList.add("playing");
        this.pausePlayBtnEl.classList.remove("paused");
        this.play();
      } else {
        this.pausePlayBtnEl.classList.remove("playing");
        this.pausePlayBtnEl.classList.add("paused");
        this.pause();
      }
    });
    this.audioEl.addEventListener("timeupdate", this.updateProgressFn);
    this.audioEl.addEventListener("timeupdate", this.handleLyricsUpdateFn);

    this.initProgressEvents();
    this.initLyricEvents();
  }

  play() {
    this.audioEl.play();
  }

  pause() {
    this.audioEl.pause();
  }

  moveToNextLyric() {
    // Change the old active lyric to visited
    this.lyricSpans?.[this.currentLyricIndex].classList.remove("active");
    this.lyricSpans?.[this.currentLyricIndex].classList.add("visited");

    const nextLyric = this.lyricSpans?.[this.currentLyricIndex + 1];
    if (nextLyric) {
      nextLyric.scrollIntoView({ block: "center", behavior: "smooth" });
      nextLyric.classList.remove("unvisited");
      nextLyric.classList.add("active");
    }
  }

  updateProgress() {
    this.progressEl.style.setProperty(
      "--progress",
      `${(this.audioEl.currentTime / this.audioEl.duration) * 100}%`
    );
    if (this.audioEl.currentTime >= this.audioEl.duration) {
      this.pausePlayBtnEl.classList.remove("playing");
      this.pausePlayBtnEl.classList.add("paused");
    }
  }

  initProgressEvents() {
    // Add drag event listeners
    this.progressEl.addEventListener("mousedown", (e) => {
      this.handleSeek(e);
      window.addEventListener("mousemove", this.handleSeekFn);
    });

    window.addEventListener("mouseup", () => {
      window.removeEventListener("mousemove", this.handleSeekFn);
    });

    this.progressEl.addEventListener("click", this.handleSeekFn);
  }

  handleLyricsUpdate() {
    const currentTime = this.audioEl.currentTime;

    if (!this.lyricArr) {
      return;
    }

    const oldLyric = this.lyricArr[this.currentLyricIndex];
    const nextLyric = this.lyricArr[this.currentLyricIndex + 1];

    if (currentTime > oldLyric[0] && nextLyric && currentTime < nextLyric[0]) {
      return;
    } else if (currentTime < oldLyric[0]) {
      const activeIdx =
        this.lyricArr.findIndex(([timestamp]) => currentTime > timestamp) - 1;
      if (activeIdx < 0) {
        return;
      }
      this.updateTimedLyrics(activeIdx);
    } else if (nextLyric && currentTime > nextLyric[0]) {
      const nextNextLyric = this.lyricArr[this.currentLyricIndex + 2];
      console.log({ nextNextLyric });
      if (!nextNextLyric || (nextNextLyric && currentTime < nextNextLyric[0]))
        this.updateTimedLyrics(this.currentLyricIndex + 1);
      else {
        const activeIdx =
          this.lyricArr
            .slice(this.currentLyricIndex + 1)
            .findIndex(([timestamp]) => timestamp > currentTime) +
          this.currentLyricIndex;
        if (activeIdx < 0) {
          return;
        }
        console.log({ activeIdx, len: this.lyricArr });
        this.updateTimedLyrics(activeIdx);
      }
    }
  }

  initLyricEvents() {
    if (!this.lyricArr) {
      return;
    }
    const lyricsContentEl = document.querySelector(
      ".lyrics-card__content"
    ) as HTMLDivElement;
    for (let i = 0; i < this.lyricArr.length; i++) {
      const [timeStamp, lyric] = this.lyricArr[i];
      const span = document.createElement("span");
      span.classList.add("lyrics-card__content__lyric");
      span.textContent = `${lyric}`;
      span.addEventListener("click", () => {
        this.audioEl.currentTime = timeStamp;
      });
      lyricsContentEl.appendChild(span);
    }

    this.lyricSpans = document.querySelectorAll(".lyrics-card__content__lyric");
  }

  updateTimedLyrics(newIdx: number) {
    const oldIdx = this.currentLyricIndex;

    if (newIdx === oldIdx + 1) {
      // Move to the next lyric
      this.moveToNextLyric();
      this.currentLyricIndex++;
    } else {
      // Hard update
      if (!this.lyricSpans) {
        return;
      }
      this.currentLyricIndex = newIdx;
      for (let i = 0; i < this.lyricSpans.length; i++) {
        const span = this.lyricSpans[i];
        span.classList.remove("active");
        span.classList.remove("unvisited");
        span.classList.remove("visited");

        if (i < newIdx) {
          span.classList.add("visited");
        } else if (i === newIdx) {
          span.classList.add("active");
          span.scrollIntoView({ block: "center", behavior: "smooth" });
        } else {
          span.classList.add("unvisited");
        }
      }
    }
  }

  handleSeek(e: MouseEvent) {
    const { clientX } = e;
    const { left, width } = this.progressEl.getBoundingClientRect();
    const percentage = (clientX - left) / width;
    this.audioEl.currentTime = this.audioEl.duration * percentage;
  }

  destroy() {
    this.audioEl.removeEventListener("timeupdate", this.updateProgressFn);
    this.audioEl.removeEventListener("timeupdate", this.handleLyricsUpdateFn);
    this.audioEl.src = "";
  }
}
