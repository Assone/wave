import { isNull, isUndefined } from "./is";

// const createAssert =
//   <T>(validator: (value: T) => boolean, formatError: <V>(value: V) => Error) =>
//   (value: unknown): asserts value is T => {
//     if (validator(value as T) === false) {
//       throw formatError(value);
//     }
//   };
export function assertNonNullable<T>(
  value: T
): asserts value is NonNullable<T> {
  if (isNull(value)) throw new Error("Value is Null");
  if (isUndefined(value)) throw new Error("Value is Undefined");
}
