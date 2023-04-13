import tester from "./tester.js";
import {
  typeOf,
  isTypeOf,
  isArrayLike,
  isValidType,
  assertType,
} from "./index.js";

class MyClass {}
class MyArray extends Array {}

await eval(`(${tester})`)(() => {
  /* --------------------------------
   * typeOf
   */

  typeOf(undefined); // "undefined"
  typeOf(null); // "null"
  typeOf(true); // "boolean"
  typeOf(false); // "boolean"
  typeOf(0); // "number"
  typeOf(333); // "number"
  typeOf(0.2e-1); // "number"
  typeOf(Infinity); // "number"
  typeOf(NaN); // "number"
  typeOf(0n); // "bigint"
  typeOf(999n); // "bigint"
  typeOf(""); // "string"
  typeOf("ttt"); // "string"
  typeOf(String(1)); // "string"
  typeOf(() => {}); // "function"
  typeOf(Boolean); // "function"
  typeOf(new Function()); // "function"
  typeOf({ __proto__: Function }); // "Function"
  typeOf(Symbol()); // "symbol"
  typeOf(Symbol.for("foo")); // "symbol"
  typeOf([]); // "Array"
  typeOf([1, 2]); // "Array"
  typeOf({}); // "Object"
  typeOf(Object.create(null)); // "Object"
  typeOf(/\s/); // "RegExp"
  typeOf(new RegExp()); // "RegExp"
  typeOf(new Error("")); // "Error"
  typeOf(new TypeError("")); // "TypeError"
  typeOf(new Date()); // "Date"
  typeOf(Math); // "Object"
  typeOf(new String("bar")); // "String"
  typeOf(new Uint32Array(2)); // "Uint32Array"
  typeOf(new Map()); // "Map"
  typeOf(new Set()); // "Set"
  typeOf(new WeakMap()); // "WeakMap"
  typeOf(new WeakSet()); // "WeakSet"
  typeOf(new ArrayBuffer(8)); // "ArrayBuffer"
  typeOf(new (class C {})()); // "C"
  typeOf(new (class D extends Date {})()); // "D"

  /* --------------------------------
   * isTypeOf
   */

  isTypeOf(true, "boolean"); // true
  isTypeOf(1, "boolean"); // false
  isTypeOf(1, "number"); // true
  isTypeOf(1, "any"); // true
  isTypeOf(null, "any"); // true
  isTypeOf(null, "null"); // true
  isTypeOf(undefined, "null"); // false
  isTypeOf(null, "undefined"); // false
  isTypeOf(undefined, "none"); // true
  isTypeOf(null, "none"); // true
  isTypeOf([], "Object"); // false
  isTypeOf({}, "Object"); // true
  isTypeOf([], "Array"); // true

  /* --------------------------------
   * isArrayLike
   */

  isArrayLike(); // false
  isArrayLike(null); // false
  isArrayLike([]); // true
  isArrayLike({ 0: 0, 1: 1 }); // false
  isArrayLike({ length: 5 }); // true
  isArrayLike(new MyArray()); // true

  /* --------------------------------
   * isValidType
   */

  isValidType(); // throws TypeError
  isValidType(5); // throws TypeError
  isValidType("string"); // throws TypeError

  isValidType("number", 1, 2); // false

  // literal

  isValidType("true, false", true, false); // true
  isValidType("false, 1", 2, "false"); // false
  isValidType("0, 43, 31.4e-1, 0xff", 0, 43, 3.14, 255); // true
  isValidType("Infinity, -Infinity, NaN", Infinity, -Infinity, NaN); // true
  isValidType("NaN", 0); // false
  isValidType("999999999999999999n", 999999999999999999n); // true
  isValidType('\'aa`"a\',`bb"b`,"cc\'c"', 'aa`"a', 'bb"b', "cc'c"); // true

  // type

  isValidType("undefined, null", undefined, null); // true
  isValidType("null", undefined); // false
  isValidType("boolean, boolean", true, false); // true
  isValidType("boolean", 0); // false
  isValidType("number, number, bigint", 77, 66, 55n); // true
  isValidType("number", 44n); // false
  isValidType("string", 33); // false
  isValidType("string", new String("")); // false
  isValidType("string", ""); // true
  isValidType("string", `Ttttttt`); // true
  isValidType("symbol, symbol", Symbol("A"), Symbol.for("b")); // true

  isValidType("none, none", undefined, null); // true
  isValidType("none", false); // false

  isValidType("any", null); // true
  isValidType("any, any, any, any", 234, "fffff", NaN, Symbol()); // true

  isValidType("function", () => {}); // true
  isValidType("RegExp", /\s*/); // true
  isValidType("Error", new Error("error")); // true
  isValidType("ReferenceError", new ReferenceError("error")); // true
  isValidType("Number", new Number(0)); // true
  isValidType("Date", new Date()); // true
  isValidType("Uint16Array", new Uint16Array()); // true
  isValidType("Map", new Map()); // true
  isValidType("Set", new Set()); // true
  isValidType("WeakMap", new WeakMap()); // true
  isValidType("WeakSet", new WeakSet()); // true

  isValidType("MyClass", new MyClass()); // true

  // array of

  isValidType("number[]", []); // true
  isValidType("number[]", [1, 2, 3]); // true
  isValidType("number[]", 1); // false
  isValidType("number[]", [1, 2, 3, "4"]); // false
  isValidType("boolean[]", [true]); // true
  isValidType("string[]", [true]); // false
  isValidType("any[]", [false, 1, "2"]); // true
  isValidType("Array", [3, "4", Symbol("5")]); // true

  isValidType("Array<number>", []); // true
  isValidType("Array<number>", [1, 2, 3]); // true
  isValidType("Array<number>", 1); // false
  isValidType("Array < number | string >", [1, "2", 3]); // true
  isValidType("Array<number|string>", [1, "2", true]); // false
  isValidType("MyArray<number|string>", new MyArray(1, "2")); // true
  isValidType("MyArray<number|string>", new MyArray(1, null)); // false

  // array

  isValidType("[]", []); // true
  isValidType("[]", [1]); // false
  isValidType("[1, boolean]", [1, true]); // true
  isValidType("[number, boolean]", [1, true, 2, 3]); // false
  isValidType("[number, boolean, ...]", [1, true, 2, 3]); // true
  isValidType("[number, , number]", [1, true, 2]); // true
  isValidType("[,,,]", [1, 2, "3"]); // true
  isValidType("[...]", [1, 2, "3"]); // true
  isValidType("Array[number]", [1]); // true
  isValidType("Array[number]", [1, 2]); // false
  isValidType("MyArray[boolean | null, number]", new MyArray(null, 1)); // true

  // object

  isValidType("{}", {}); // true
  isValidType("{}", { a: 1 }); // false
  isValidType("{ a: number, b: string }", { a: 1, b: "2" }); // true
  isValidType("{ a: number }", { a: 1, b: "2" }); // false
  isValidType("{ a: number, ... }", { a: 1, b: "2" }); // true
  isValidType("{...}", { a: 1, b: "2" }); // true
  isValidType("{$_: number, ` '`: boolean}", { $_: 1, " '": true }); // true
  isValidType("{ a?: 1, b?: 2, c: 3 }", { b: 2, c: 3 }); // true
  isValidType('{ "a?": 1 }', {}); // false
  isValidType("Object", { a: 1, b: true }); // true
  isValidType("Object{ c: number }", { a: 1 }); // false
  isValidType("MyClass{ a: number }", ((o) => ((o.a = 1), o))(new MyClass())); // true
  isValidType("MyArray{ length: number }", new MyArray()); // true
  isValidType("MyArray{ length: 2, 0: 1, 1: 2 }", new MyArray(1, 2)); // true
  isValidType("RegExp{ source: '\\s+' }", /\s+/); // true
  isValidType('TypeError{ message: "error" }', new TypeError("error")); // true

  // union

  isValidType("number | string", "bar"); // true
  isValidType("number|string", 1); // true
  isValidType("number | string", null); // false
  isValidType("Array<string|string[]|boolean>", [true, ["aaa", "bbb"], "bbb"]); // true
  isValidType('none|"ok"', null); // true
  isValidType('none|"ok"', true); // false
  isValidType('none|"ok"', "kk"); // false
  isValidType('null|1|2|3|4|5|6|"auto"', 16); // false
  isValidType('null|1|2|3|4|5|6|"auto"', "auto"); // true
  isValidType("bigint|boolean, bigint|boolean", 0n, false); // true

  /* --------------------------------
   * assertType
   */

  assertType("Array<number>, function", [1, 2, 3], () => {});
  assertType("Array", { length: 0 }); // throws TypeError
});
