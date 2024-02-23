export function isTouchEvent(ev: MouseEvent | TouchEvent): ev is TouchEvent {
  return "touches" in ev;
}
