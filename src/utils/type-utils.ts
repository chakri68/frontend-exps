export function assertOrThrow<T>(x: T): NonNullable<T> {
  if (x === undefined || x === null) {
    throw new Error("Expected value to be non-nullable");
  }
  return x;
}
