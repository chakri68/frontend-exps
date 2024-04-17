import { OptionalObjectOf, mergeOptionals } from "@/utils/type-utils";
import { WeekDayShort } from "./types";
import {
  MultiSelectionManager,
  RangeSelectionManager,
  SingleSelectionManager,
} from "./MonthGridSelectionManager";

export type MonthGridState =
  | {
      rendered: false;
    }
  | {
      rendered: true;
      data: { day: string; date: string }[];
      grid: HTMLElement;
      selectionManager:
        | SingleSelectionManager
        | MultiSelectionManager
        | RangeSelectionManager;
    };

export type MonthGridOptions = {
  selectionMode?: "single" | "multiple" | "range" | "all";
};

const defaultOptions: OptionalObjectOf<MonthGridOptions> = {
  selectionMode: "all",
};

export class MonthGrid {
  state: MonthGridState = { rendered: false };
  options: Required<MonthGridOptions> = defaultOptions;
  selectChangeHandler: (e: Event) => void;
  subscribers: ((state: MonthGridState & any) => void)[] = [];

  constructor(
    options: MonthGridOptions,
    private parent: HTMLElement = document.body
  ) {
    this.options = mergeOptionals(options, this.options);
    this.selectChangeHandler = this.handleSelectChange.bind(this);
  }

  render(data: { day: string; date: string }[]) {
    const grid = this.getGridTemplate();
    const gridEl = grid.children[0] as HTMLElement;
    this.state = {
      rendered: true,
      data,
      grid: gridEl,
      selectionManager: null as any,
    };
    const gridBody = grid.querySelector(".grid-body") as HTMLElement;

    data.sort((a, b) => parseInt(a.date) - parseInt(b.date));

    for (const { day, date } of data) {
      if (date === "1") {
        const idx = WeekDayShort.indexOf(day);
        for (let i = 0; i < idx; i++) {
          const gridItem = this.getGridItemTemplate();
          gridItem.children[0].classList.add("empty");
          gridBody.appendChild(gridItem);
        }
      }
      const gridItem = this.getGridItemTemplate();
      const gridItemEl = gridItem.children[0] as HTMLElement;
      const spanEl = gridItem.querySelector(
        ".grid-item-content"
      ) as HTMLSpanElement;
      spanEl.textContent = date;
      gridItemEl.dataset.date = date;
      gridBody.appendChild(gridItem);
    }

    this.parent.appendChild(grid);

    // Check if the mode is all - to render the select dropdown
    if (this.options.selectionMode === "all") {
      const selectMenu = gridEl.querySelector(
        ".mode-select"
      ) as HTMLSelectElement;

      // Add the options
      const options = ["Single", "Multiple", "Range"];
      for (const option of options) {
        const optionEl = document.createElement("option");
        optionEl.value = option.toLowerCase();
        optionEl.textContent = option;
        selectMenu?.appendChild(optionEl);
      }
    } else {
      const selectMenu = gridEl.querySelector(".mode-select");
      selectMenu?.remove();
    }

    if (this.options.selectionMode !== "all") {
      this.updateSelectionManager(this.options.selectionMode);
    } else {
      this.updateSelectionManager("single");
    }

    this.setupListeners();
  }

  setupListeners() {
    if (!this.state.rendered) {
      throw new Error("MonthGrid not rendered yet");
    }

    const selectMenu = this.state.grid.querySelector(
      ".mode-select"
    ) as HTMLSelectElement;
    selectMenu?.addEventListener("change", this.selectChangeHandler);
  }

  subscribe(cb: (state: MonthGridState) => void) {
    this.subscribers.push(cb);
  }

  fire(data: any) {
    for (const subscriber of this.subscribers) {
      subscriber(data);
    }
  }

  handleSelectChange(e: Event) {
    if (!this.state.rendered) {
      throw new Error("MonthGrid not rendered yet");
    }

    const target = e.currentTarget as HTMLSelectElement;
    const value = target.value;
    this.updateSelectionManager(value as "single" | "multiple" | "range");
  }

  updateSelectionManager(mode: "single" | "multiple" | "range") {
    if (!this.state.rendered) {
      throw new Error("MonthGrid not rendered yet");
    }

    const selectMenu = this.state.grid.querySelector(
      ".mode-select"
    ) as HTMLSelectElement;

    if (selectMenu) selectMenu.value = mode;
    const prevManager = this.state.selectionManager;
    let newManager:
      | SingleSelectionManager
      | MultiSelectionManager
      | RangeSelectionManager;

    if (mode === "single") {
      newManager = new SingleSelectionManager(this);
    } else if (mode === "multiple") {
      newManager = new MultiSelectionManager(this);
    } else if (mode === "range") {
      newManager = new RangeSelectionManager(this);
    } else {
      newManager = new SingleSelectionManager(this);
    }

    prevManager?.unMount();

    newManager.subscribe((data) => {
      console.log({ data });
      this.fire({ ...this.state, data });
    });
    this.state.selectionManager = newManager;
  }

  getGridItemTemplate() {
    const gridTemplate = document.getElementById(
      "grid-item-template"
    ) as HTMLTemplateElement;

    // Clone the template content
    const templateContent = gridTemplate.content.cloneNode(
      true
    ) as DocumentFragment;

    return templateContent;
  }

  getGridTemplate() {
    const gridTemplate = document.getElementById(
      "grid-template"
    ) as HTMLTemplateElement;

    // Clone the template content
    const templateContent = gridTemplate.content.cloneNode(
      true
    ) as DocumentFragment;

    return templateContent;
  }
}
