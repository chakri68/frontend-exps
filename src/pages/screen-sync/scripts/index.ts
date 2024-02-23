import { assertOrThrow } from "@/utils/type-utils";
import "../styles/index.scss";

type GlobalCoords = {
  [id: string]: [number, number];
};

const ID =
  new URLSearchParams(window.location.search).get("id") || new Date().getTime();

let cachedCoords = {
  size: [window.innerWidth, window.innerHeight],
  position: [window.screenX, window.screenY],
};

const canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

document.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

document.body.appendChild(canvas);

canvas.addEventListener("click", (event) => {
  const ctx = assertOrThrow(canvas.getContext("2d"));
  // Add a new dot
  const [x, y] = localToGlobalCoords([event.clientX, event.clientY] as [
    number,
    number
  ]);
  const globalCoords = JSON.parse(
    localStorage.getItem("coords") || "{}"
  ) as GlobalCoords;
  localStorage.setItem(
    "coords",
    JSON.stringify({ ...globalCoords, [ID]: [x, y] })
  );
  renderCoords({ ...globalCoords, [ID]: [x, y] as [number, number] });
});

const globalToLocalCoords = (coords: [number, number]) => {
  return [coords[0] - window.screenX, coords[1] - window.screenY] as [
    number,
    number
  ];
};

const localToGlobalCoords = (coords: [number, number]) => {
  return [coords[0] + window.screenX, coords[1] + window.screenY] as [
    number,
    number
  ];
};

const renderCoords = (globalCoords: GlobalCoords) => {
  // Clear the canvas
  const ctx = assertOrThrow(canvas.getContext("2d"));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  Object.entries(globalCoords).forEach(([id]) => {
    const [x, y] = globalToLocalCoords(globalCoords[id]);
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fill();
  });
};

const moveDot = () => {
  if (
    cachedCoords.size[0] === window.innerWidth &&
    cachedCoords.size[1] === window.innerHeight &&
    cachedCoords.position[0] === window.screenX &&
    cachedCoords.position[1] === window.screenY
  ) {
    window.requestAnimationFrame(moveDot);
    return;
  }

  cachedCoords = {
    size: [window.innerWidth, window.innerHeight],
    position: [window.screenX, window.screenY],
  };

  const globalCoords = JSON.parse(
    localStorage.getItem("coords") || "{}"
  ) as GlobalCoords;

  renderCoords(globalCoords);

  window.requestAnimationFrame(moveDot);
};

window.requestAnimationFrame(moveDot);
