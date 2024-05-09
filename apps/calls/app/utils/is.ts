/* eslint-disable @typescript-eslint/no-explicit-any */
type TypeOfType =
  | "string"
  | "number"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "function";

const { getPrototypeOf } = Object;

const typeOf =
  <T>(type: TypeOfType) =>
  (value: unknown): value is T =>
    typeof value === type;

const kindCache: Record<string, string> = {};

export const kindOf = (value: unknown): string => {
  const type = toString.call(value);

  if (!kindCache[type]) {
    kindCache[type] = type.slice(8, -1).toLowerCase();
  }

  return kindCache[type] as string;
};

// const getValueType = (value: unknown): string => kindOf(value);

export const isString = typeOf<string>("string");

export const isNull = (value: unknown): value is null => value === null;

export const isUndefined = typeOf<undefined>("undefined");

// eslint-disable-next-line @typescript-eslint/ban-types
export const isFunction = typeOf<Function>("function");

export const isObject = <T extends Record<keyof any, any>>(
  value: unknown
): value is T => value !== null && kindOf(value) === "object";

export const isPlainObject = <T extends Record<keyof any, any>>(
  value: unknown
): value is T => {
  if (isObject(value) === false) return false;

  const prototype = getPrototypeOf(value);
  return (
    (prototype === null ||
      prototype === Object.prototype ||
      Object.getPrototypeOf(prototype) === null) &&
    !(Symbol.toStringTag in value) &&
    !(Symbol.iterator in value)
  );
};

export const isNonNullable = <T>(value: T): value is NonNullable<T> =>
  isUndefined(value) === false && isNull(value) === false;

export const isKeyInRecord = <T extends object>(
  value: T,
  key: keyof any
): key is keyof T => key in value;

export const isError = <T extends Error>(value: unknown): value is T =>
  value instanceof Error;

export const isClient =
  typeof window !== "undefined" && typeof document !== "undefined";
