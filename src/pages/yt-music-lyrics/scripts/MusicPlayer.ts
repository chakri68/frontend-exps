export class MusicPlayer {
  audioEl: HTMLAudioElement;
  progressEl: HTMLDivElement;
  pausePlayBtnEl: HTMLButtonElement;
  lyricSpans: NodeListOf<HTMLSpanElement> | null = null;

  updateProgressFn: () => void;
  updateLyricClassesFn: () => void;
  handleSeekFn: (e: MouseEvent) => void;

  // For efficient updates of classes
  currentLyricIndex = 0;

  constructor(
    public file: File,
    public lyricArr: [number, string][] | null = null
  ) {
    this.handleSeekFn = this.handleSeek.bind(this);
    this.updateProgressFn = this.updateProgress.bind(this);
    this.updateLyricClassesFn = this.softUpdateLyricClasses.bind(this);

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

    this.audioEl.addEventListener("timeupdate", this.updateLyricClassesFn);

    this.initProgressEvents();
    this.initLyricEvents();
  }

  play() {
    this.hardUpdateLyricClasses();
    this.audioEl.play();
  }

  pause() {
    this.audioEl.pause();
  }

  hardUpdateLyricClasses() {
    const time = this.audioEl.currentTime;
    const lArr = this.lyricArr;
    if (!lArr) {
      return;
    }
    // Mark all the lyrics till the active one as played
    this.lyricSpans?.forEach((span, i) => {
      span.classList.remove("active");
      span.classList.remove("unvisited");
      span.classList.remove("visited");

      if (lArr[i][0] > time) {
        span.classList.add("unvisited");
      } else if (lArr[i][0] <= time) {
        span.classList.add("visited");
      }
      if (lArr[i][0] <= time && lArr[i + 1] && lArr[i + 1][0] >= time) {
        this.currentLyricIndex = i;
        span.scrollIntoView({ block: "center", behavior: "smooth" });
        span.classList.add("active");
      }
    });
  }

  softUpdateLyricClasses() {
    // Soft update - basically more efficient than hard update
    if (!this.lyricArr) {
      return;
    }
    if (
      this.lyricArr[this.currentLyricIndex + 1][0] <= this.audioEl.currentTime
    ) {
      this.moveToNextLyric();
    }
  }

  moveToNextLyric() {
    // Change the old active lyric to visited
    this.lyricSpans?.[this.currentLyricIndex].classList.remove("active");
    this.lyricSpans?.[this.currentLyricIndex].classList.add("visited");

    this.currentLyricIndex++;
    const nextLyric = this.lyricSpans?.[this.currentLyricIndex];
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

  initLyricEvents() {
    if (!this.lyricArr) {
      return;
    }
    const lyricsContentEl = document.querySelector(
      ".lyrics-card__content"
    ) as HTMLDivElement;
    for (const [timeStamp, lyric] of this.lyricArr) {
      const span = document.createElement("span");
      span.classList.add("lyrics-card__content__lyric");
      span.textContent = `${lyric}`;
      span.addEventListener("click", () => {
        this.audioEl.currentTime = timeStamp;
        this.hardUpdateLyricClasses();
      });
      lyricsContentEl.appendChild(span);
    }

    this.lyricSpans = document.querySelectorAll(".lyrics-card__content__lyric");
  }

  handleSeek(e: MouseEvent) {
    const { clientX } = e;
    const { left, width } = this.progressEl.getBoundingClientRect();
    const percentage = (clientX - left) / width;
    this.audioEl.currentTime = this.audioEl.duration * percentage;
    this.hardUpdateLyricClasses();
  }

  destroy() {
    this.audioEl.removeEventListener("timeupdate", this.updateProgressFn);
    this.audioEl.removeEventListener("timeupdate", this.updateLyricClassesFn);
    this.audioEl.src = "";
  }
}
