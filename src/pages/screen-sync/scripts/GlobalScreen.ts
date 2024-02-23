import { IComparable } from "@/utils/Comparable";
import { Observable } from "@utils/Observable";
import { CustomWindow } from "./types";

declare let window: CustomWindow;

export type Position = [number, number];
export interface WindowState extends IComparable {
  size: [number, number];
  position: [number, number];
}

export function compareStates(a: WindowState, b: WindowState) {
  return (
    a.position[0] === b.position[0] &&
    a.position[1] === b.position[1] &&
    a.size[0] === b.size[0] &&
    a.size[1] === b.size[1]
  );
}

export function getWindowState(): WindowState {
  return {
    position: [window.screenX, window.screenY],
    size: [window.outerWidth, window.outerHeight],
    compare(c: WindowState) {
      return compareStates(this, c);
    },
  };
}

export const ScreenObservable = new Observable<WindowState>({
  position: [window.screenX, window.screenY],
  size: [window.outerWidth, window.outerHeight],
  compare(c: WindowState) {
    return compareStates(this, c);
  },
});

export const screenObservableFrameFunc = () => {
  window["screenObservableRunning"] = true;

  const oldState = ScreenObservable.get();
  const newState = getWindowState();

  if (!oldState.compare(newState)) {
    ScreenObservable.set(newState);
  }

  window.requestAnimationFrame(screenObservableFrameFunc);
};

if (window.screenObservableRunning !== true) {
  window.requestAnimationFrame(screenObservableFrameFunc);
}

export function useScreenCoords(position: Position): Observable<Position> {
  const windowObservable = new Observable<Position>(position);

  ScreenObservable.subscribe((oldState, newState) => {
    const [x, y] = windowObservable.get();
    windowObservable.set([
      x + oldState.position[0] - newState.position[0],
      y + oldState.position[1] - newState.position[1],
    ]);
  });

  return windowObservable;
}
