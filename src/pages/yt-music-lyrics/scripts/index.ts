import { base64ArrayBuffer } from "@/utils/base64";
import "../styles/index.scss";
import jsmediatags from "./jsmediatags/jsmediatags.js";
import { MusicPlayer } from "./MusicPlayer";
import getDominantColor from "@/utils/getDominantColor";

async function jsMediaTags(file: File | string | Blob) {
  return await new Promise((resolve, reject) => {
    // @ts-ignore
    jsmediatags.read(file, {
      onSuccess: function (tag: any) {
        resolve(tag);
      },
      onError: function (error: any) {
        reject(error);
      },
    });
  });
}

function showElement(el: HTMLElement) {
  el.classList.remove("hidden");
}
function hideElement(el: HTMLElement) {
  el.classList.add("hidden");
}

function processLyrics(lyrics: string) {
  const lines = lyrics.split("\n").map((l) => l.trim());
  return lines.reduce(
    (acc, line) => {
      const timeStamp = line.match(/\[(\d|\.|:)+\]/g)?.[0]; // Of the form [00:00.00]
      // Convert the timestamp to seconds
      if (!timeStamp) {
        return acc;
      }

      const timeStampSeconds = timeStamp
        .replace(/\[|\]/g, "")
        .split(":")
        .reduce((acc, time, i) => {
          return acc + parseFloat(time) * Math.pow(60, 1 - i);
        }, 0);

      const lyric = line.replace(timeStamp, "").trim();
      if (acc[timeStampSeconds] !== undefined) {
        return {
          ...acc,
          [timeStampSeconds + 1]: lyric,
        };
      }

      return {
        ...acc,
        [timeStampSeconds]: lyric,
      };
    },
    { 0: "♪" } as Record<number, string>
  );
}

const inpCard = document.getElementById("inp-card") as HTMLElement;
const lyricsTextArea = document.getElementById("lyrics") as HTMLTextAreaElement;
inpCard.querySelector("button")?.addEventListener("click", handleMusicSubmit);
const lyricsCard = document.getElementById("lyrics-card") as HTMLElement;
const mainEl = document.querySelector("main") as HTMLElement;
const musicPlayerEl = document.querySelector(".music-player") as HTMLDivElement;

function mainLoop() {
  // Show the input card first and then the lyrics card
  showElement(inpCard);
}

async function handleMusicSubmit() {
  const inpEl = mainEl.querySelector("input") as HTMLInputElement;
  // Get the file from the input element
  const file = inpEl.files?.[0];
  if (!file) {
    alert("Please select a file first!");
    return;
  }

  // Read the file
  const { tags } = (await jsMediaTags(file)) as any;

  console.log({ tags });

  const lyrics = lyricsTextArea.value?.trim() || tags.lyrics?.lyrics;

  console.log({ lyrics });

  const albumArt = tags.picture?.data;

  const bgEl = lyricsCard;

  if (albumArt) {
    const base64String = base64ArrayBuffer(new Uint8Array(albumArt).buffer);
    const dominantColor = await getDominantColor(
      `data:image/png;base64,${base64String}`
    );
    musicPlayerEl.style.setProperty("--theme-color", dominantColor);
    bgEl.style.backgroundImage = `url('data:image/png;base64,${base64String}')`;
  } else {
    bgEl.style.backgroundImage = "none";
  }

  const lyricsContentEl = lyricsCard.querySelector(".lyrics-card__content");
  if (!lyricsContentEl) {
    throw new Error("Lyrics content element not found!");
  }

  lyricsContentEl.innerHTML = "";

  if (lyrics) {
    const processedLyrics = processLyrics(lyrics);

    const sortedLyrics = Object.entries(processedLyrics).map(
      ([timeStamp, lyric]) => [parseInt(timeStamp), lyric]
    ) as [number, string][];
    sortedLyrics.sort(([a], [b]) => {
      return a - b;
    });

    const musicPlayer = new MusicPlayer(file, sortedLyrics);
    musicPlayer.play();
  } else {
    const musicPlayer = new MusicPlayer(file);
    musicPlayer.play();
    lyricsContentEl.innerHTML = "No lyrics found!";
  }

  hideElement(inpCard);
  showElement(lyricsCard);
}

mainLoop();
