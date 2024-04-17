import { MonthGrid, MonthGridOptions } from "./MonthGrid";

type Subscriber<T> = {
  id: number;
  callback: (data: T) => void;
};

class MonthGridSelectionManager<T> {
  protected subscribers: Subscriber<T>[] = [];
  protected idCount = 0;
  protected mode: MonthGridOptions["selectionMode"];

  constructor(protected grid: MonthGrid) {
    this.mode = grid.options.selectionMode;
  }

  setupListeners() {
    throw new Error("Method not implemented.");
  }

  fire(data: T) {
    for (const sub of this.subscribers) {
      sub.callback(data);
    }
  }

  subscribe(callback: Subscriber<T>["callback"]) {
    this.subscribers.push({
      id: this.idCount++,
      callback,
    });
    return this.idCount - 1;
  }

  unsubscribe(id: number) {
    this.subscribers = this.subscribers.filter((sub) => sub.id !== id);
  }

  unMount() {
    throw new Error("Method not implemented.");
  }
}

export class SingleSelectionManager extends MonthGridSelectionManager<{
  date: string | null;
}> {
  private state: {
    selectedDate: string | null;
  } = {
    selectedDate: null,
  };
  clickHandler: (e: Event) => void;

  constructor(grid: MonthGrid) {
    super(grid);
    this.clickHandler = this.handleClick.bind(this);

    this.setupListeners();
  }

  setupListeners() {
    if (!this.grid.state.rendered)
      throw new Error("MonthGrid not rendered yet");

    const gridItems = this.grid.state.grid.querySelectorAll(".grid-item");
    gridItems.forEach((item) => {
      item.addEventListener("click", this.clickHandler);
    });
  }

  unMount() {
    if (!this.grid.state.rendered)
      throw new Error("MonthGrid not rendered yet");

    const gridItems = this.grid.state.grid.querySelectorAll(".grid-item");

    gridItems.forEach((item) => {
      item.classList.remove("selected");
      item.removeEventListener("click", this.clickHandler);
    });
  }

  handleClick(e: Event) {
    const target = e.currentTarget as HTMLElement;
    const date = target.dataset.date;

    if (!date) throw new Error("Date not found");

    if (this.state.selectedDate) {
      if (!this.grid.state.rendered)
        throw new Error("MonthGrid not rendered yet");
      const prevSelected = this.grid.state.grid.querySelector(
        `[data-date="${this.state.selectedDate}"]`
      );
      prevSelected?.classList.remove("selected");

      if (this.state.selectedDate === date) {
        this.state.selectedDate = null;
        this.fire({
          date: null,
        });
        return;
      }
    }

    this.state.selectedDate = date;
    target.classList.add("selected");
    this.fire({
      date,
    });
  }
}

export class MultiSelectionManager extends MonthGridSelectionManager<{
  date: string[];
}> {
  private state: {
    selectedDate: string[];
  } = {
    selectedDate: [],
  };
  clickHandler: (e: Event) => void;

  constructor(grid: MonthGrid) {
    super(grid);
    this.clickHandler = this.handleClick.bind(this);

    this.setupListeners();
  }

  setupListeners() {
    if (!this.grid.state.rendered)
      throw new Error("MonthGrid not rendered yet");

    const gridItems = this.grid.state.grid.querySelectorAll(".grid-item");

    gridItems.forEach((item) => {
      item.addEventListener("click", this.clickHandler);
    });
  }

  handleClick(e: Event) {
    const target = e.currentTarget as HTMLElement;
    const date = target.dataset.date;

    if (!date) throw new Error("Date not found");

    if (this.state.selectedDate.includes(date)) {
      this.state.selectedDate = this.state.selectedDate.filter(
        (d) => d !== date
      );
      target.classList.remove("selected");
      this.fire({
        date: this.state.selectedDate,
      });
      return;
    }

    this.state.selectedDate.push(date);
    target.classList.add("selected");
    this.fire({
      date: this.state.selectedDate,
    });
  }

  unMount() {
    if (!this.grid.state.rendered)
      throw new Error("MonthGrid not rendered yet");

    const gridItems = this.grid.state.grid.querySelectorAll(".grid-item");

    gridItems.forEach((item) => {
      item.classList.remove("selected");
      item.removeEventListener("click", this.clickHandler);
    });
  }
}

export class RangeSelectionManager extends MonthGridSelectionManager<{
  startDate: string | null;
  endDate: string | null;
}> {
  private state: {
    startDate: string | null;
    endDate: string | null;
  } = {
    startDate: null,
    endDate: null,
  };
  hoverHandler: (e: Event) => void;
  leaveHandler: () => void;
  clickHandler: (e: Event) => void;

  constructor(grid: MonthGrid) {
    super(grid);

    this.hoverHandler = this.handleHover.bind(this);
    this.leaveHandler = this.handleLeave.bind(this);
    this.clickHandler = this.handleClick.bind(this);

    this.setupListeners();
  }

  setupListeners() {
    if (!this.grid.state.rendered)
      throw new Error("MonthGrid not rendered yet");

    const gridItems = this.grid.state.grid.querySelectorAll(".grid-item");

    gridItems.forEach((item) => {
      item.addEventListener("click", this.clickHandler);
    });
  }

  addHoverListener() {
    if (!this.grid.state.rendered)
      throw new Error("MonthGrid not rendered yet");

    const gridEl = this.grid.state.grid;
    gridEl.addEventListener("mouseleave", this.leaveHandler);

    const gridItems = this.grid.state.grid.querySelectorAll(".grid-item");

    gridItems.forEach((item) => {
      item.addEventListener("mouseover", this.hoverHandler);
    });
  }

  removeHoverListener() {
    if (!this.grid.state.rendered)
      throw new Error("MonthGrid not rendered yet");

    const gridEl = this.grid.state.grid;
    gridEl.removeEventListener("mouseleave", this.leaveHandler);

    const gridItems = this.grid.state.grid.querySelectorAll(".grid-item");
    gridItems.forEach((item) => {
      item.classList.remove("hovered");
      item.removeEventListener("mouseover", this.hoverHandler);
    });
  }

  handleLeave() {
    if (!this.grid.state.rendered)
      throw new Error("MonthGrid not rendered yet");
    const gridEl = this.grid.state.grid;
    const gridItems = gridEl.querySelectorAll(".grid-item");
    gridItems.forEach((item) => {
      item.classList.remove("hovered");
    });
  }

  handleHover(e: Event) {
    if (!this.grid.state.rendered)
      throw new Error("MonthGrid not rendered yet");

    const hoveredEl = e.currentTarget as HTMLElement;
    const hoveredDate = hoveredEl.dataset.date;

    if (!hoveredDate) throw new Error("Date not found");

    if (!this.state.startDate) return;

    const [start, end] = [
      parseInt(this.state.startDate),
      parseInt(hoveredDate),
    ];

    const gridItems = this.grid.state.grid.querySelectorAll(".grid-item");

    gridItems.forEach((item) => {
      item.classList.remove("hovered");
    });

    if (start < end) {
      for (let i = start; i <= end; i++) {
        const item = this.grid.state.grid.querySelector(`[data-date="${i}"]`);
        item?.classList.add("hovered");
      }
      return;
    }
  }

  handleClick(e: Event) {
    if (!this.grid.state.rendered)
      throw new Error("MonthGrid not rendered yet");
    const target = e.currentTarget as HTMLElement;
    const date = target.dataset.date;

    if (!date) throw new Error("Date not found");

    if (!this.state.startDate) {
      this.state.startDate = date;
      target.classList.add("selected");
      this.addHoverListener();
      this.fire({
        startDate: this.state.startDate,
        endDate: null,
      });
      return;
    }

    const gridItems = this.grid.state.grid.querySelectorAll(".grid-item");

    if (this.state.startDate && this.state.endDate) {
      this.state.startDate = date;
      this.state.endDate = null;
      gridItems.forEach((item) => {
        item.classList.remove("selected");
      });
      target.classList.add("selected");
      this.addHoverListener();
      this.fire({
        startDate: this.state.startDate,
        endDate: null,
      });
      return;
    }

    if (this.state.startDate && !this.state.endDate) {
      const [start, end] = [parseInt(this.state.startDate), parseInt(date)];
      if (start > end) {
        this.state.startDate = date;
        this.state.endDate = null;
        gridItems.forEach((item) => {
          item.classList.remove("selected");
        });
        target.classList.add("selected");
        this.addHoverListener();
        this.fire({
          startDate: this.state.startDate,
          endDate: null,
        });
        return;
      } else {
        this.state.endDate = date;
        for (let i = start; i <= end; i++) {
          const item = this.grid.state.grid.querySelector(`[data-date="${i}"]`);
          item?.classList.add("selected");
        }
        this.removeHoverListener();
        this.fire({
          startDate: this.state.startDate,
          endDate: this.state.endDate,
        });
        return;
      }
    }

    this.state.startDate = date;
    target.classList.add("selected");
    this.removeHoverListener();
    this.fire({
      startDate: this.state.startDate,
      endDate: this.state.endDate,
    });
  }

  unMount() {
    if (!this.grid.state.rendered)
      throw new Error("MonthGrid not rendered yet");

    const gridEl = this.grid.state.grid;
    gridEl.removeEventListener("mouseleave", this.leaveHandler);

    const gridItems = this.grid.state.grid.querySelectorAll(".grid-item");
    gridItems.forEach((item) => {
      item.classList.remove("hovered");
      item.classList.remove("selected");
      item.removeEventListener("click", this.clickHandler);
    });
  }
}
