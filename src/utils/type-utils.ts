export function assertOrThrow<T>(x: T): NonNullable<T> {
  if (x === undefined || x === null) {
    throw new Error("Expected value to be non-nullable");
  }
  return x;
}

export type OptionalPropertiesOf<T extends object> = Exclude<
  {
    [K in keyof T]: T extends Record<K, T[K]> ? never : K;
  }[keyof T],
  undefined
>;

export type OptionalObjectOf<T extends object> = {
  [K in OptionalPropertiesOf<T>]: Exclude<T[K], undefined>;
};

export function mergeOptionals<T extends object>(
  obj: T,
  partial: OptionalObjectOf<T>
): Required<T> {
  return { ...partial, ...obj } as Required<T>;
}
