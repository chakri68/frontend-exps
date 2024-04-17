import "../styles/index.scss";
import { MonthGrid } from "./MonthGrid";
import { WeekDay, WeekDayShort } from "./types";

console.log("CONNECTED!");

const monthGrid = new MonthGrid({
  selectionMode: "all",
});

monthGrid.render(
  Array.from({ length: 30 }, (_, i) => ({
    day: WeekDayShort[(i + 2) % WeekDayShort.length],
    date: `${i + 1}`,
  }))
);

monthGrid.subscribe((state) => {
  console.log({ state }, (state as any).data);
});
