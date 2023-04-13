import parse from "./parse.js";

export function typeOf(item) {
  const t = typeof item;
  return t != "object"
    ? t
    : item == null
    ? "null"
    : Object.getPrototypeOf(item)?.constructor?.name ??
      Object.prototype.toString.call(item).slice(8, -1);
}

export function isTypeOf(item, name) {
  return name == "any"
    ? true
    : name == "none"
    ? item == null
    : typeOf(item) == name;
}

export function isArrayLike(item) {
  return typeof item?.length == "number";
}

export function isValidType(template, ...items) {
  if (typeof template != "string" || !template) {
    throw new TypeError("No template specified");
  }
  if (items.length == 0) {
    throw new TypeError("No items specified");
  }

  return items.length == 1
    ? checkItem(items[0], parse(template))
    : checkItem(items, parse(`[ ${template} ]`));
}

export function assertType(...args) {
  if (!isValidType(...args)) {
    throw new TypeError("Type mismatch");
  }
}

function checkItem(item, specs) {
  switch (specs.type) {
    case "literal":
      return typeof specs.value == "number" && isNaN(specs.value)
        ? typeof item == "number" && isNaN(item)
        : item === specs.value;

    case "type":
      return isTypeOf(item, specs.name);

    case "arrayOf":
      if (!isTypeOf(item, specs.name) || !isArrayLike(item)) {
        return false;
      }
      for (let i = 0; i < item.length; i++) {
        if (!checkItem(item[i], specs.item)) {
          return false;
        }
      }
      return true;

    case "array":
      if (
        !isArrayLike(item) ||
        !isTypeOf(item, specs.name) ||
        (!specs.limitless && item.length != specs.items.length)
      ) {
        return false;
      }
      for (let i = 0; i < specs.items.length; i++) {
        if (!checkItem(item[i], specs.items[i])) {
          return false;
        }
      }
      return true;

    case "object":
      if (item == null || !isTypeOf(item, specs.name)) {
        return false;
      }
      if (!specs.limitless) {
        for (const itemKey of Object.keys(item)) {
          if (!~specs.entries.findIndex(([key]) => key == itemKey)) {
            return false;
          }
        }
      }
      return specs.entries.every(([key, specsItem, maybe]) =>
        key in item ? checkItem(item[key], specsItem) : maybe
      );

    case "union":
      return specs.items.some((specsItem) => checkItem(item, specsItem));

    default:
      throw new Error(`Unknown type '${specs.type}'`);
  }
}
