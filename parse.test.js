import tester from "./tester.js";
import parse from "./parse.js";

await eval(`(${tester})`)(() => {
  /* --------------------------------
   * incorrect template
   */

  parse(); // throws TypeError
  parse(""); // throws TypeError
  parse(1); // throws TypeError
  parse(false); // throws TypeError
  parse(":)"); // throws TypeError

  /* --------------------------------
   * boolean litiral
   */

  parse("true"); // { type: "literal", value: true }
  parse("false"); // { type: "literal", value: false }

  /* --------------------------------
   * BigInt literal
   */

  parse("1234567n"); // { type: "literal", value: 1234567n }
  parse("-987654n"); // { type: "literal", value: -987654n }

  /* --------------------------------
   * numeric literal
   */

  parse("123"); // { type: "literal", value: 123 }
  parse("-123"); // { type: "literal", value: -123 }
  parse("0B10101"); // { type: "literal", value: 0b10101 }
  parse("0o7654"); // { type: "literal", value: 0o7654 }
  parse("0xffFF"); // { type: "literal", value: 0xffff }
  parse("0x00e1"); // { type: "literal", value: 225 }
  parse("2.14"); // { type: "literal", value: 2.14 }
  parse("-2.14e-3"); // { type: "literal", value: -0.00214 }
  parse("NaN"); // { type: "literal", value: NaN }
  parse("Infinity"); // { type: "literal", value: Infinity }
  parse("-Infinity"); // { type: "literal", value: -Infinity }
  parse("-0"); // { type: "literal", value: 0 }

  parse("0xf.2"); // throws TypeError
  parse("2.46.3"); // throws TypeError
  parse("6e-.3"); // throws TypeError

  /* --------------------------------
   * string literal
   */

  parse("``"); // { type: "literal", value: "" }
  parse('"aa bb cc"'); // { type: "literal", value: "aa bb cc" }
  parse("'aa \"bb cc'"); // { type: "literal", value: 'aa "bb cc' }
  parse("`aa \"b'b cc`"); // { type: "literal", value: "aa \"b'b cc" }

  /* --------------------------------
   * type name
   */

  parse("string"); // { type: "type", name: "string" }
  parse("__$Strange370"); // { type: "type", name: "__$Strange370" }

  /* --------------------------------
   * array of
   */

  parse("number[]"); /* {
    type: "arrayOf",
    name: "Array",
    item: { type: "type", name: "number" },
  } */

  parse("MyClass[]"); /* {
    type: "arrayOf",
    name: "Array",
    item: { type: "type", name: "MyClass" },
  } */

  parse("Array<number>"); /* {
    type: "arrayOf",
    name: "Array",
    item: { type: "type", name: "number" },
  } */

  parse("DuckArray<boolean|string>"); /* {
    type: "arrayOf",
    name: "DuckArray",
    item: {
      type: "union",
      items: [
        { type: "type", name: "boolean" },
        { type: "type", name: "string" },
      ],
    },
  } */

  /* --------------------------------
   * array
   */

  parse("[]"); /* {
    type: "array",
    name: "Array",
    limitless: false,
    items: [],
  } */

  parse("[1]"); /* {
    type: "array",
    name: "Array",
    limitless: false,
    items: [{ type: "literal", value: 1 }],
  } */

  parse("[...]"); /* {
    type: "array",
    name: "Array",
    limitless: true,
    items: [],
  } */

  parse("[number, true]"); /* {
    type: "array",
    name: "Array",
    limitless: false,
    items: [
      { type: "type", name: "number" },
      { type: "literal", value: true },
    ],
  } */

  parse("[string , Object,boolean, ...]"); /* {
    type: "array",
    name: "Array",
    limitless: true,
    items: [
      { type: "type", name: "string" },
      { type: "type", name: "Object" },
      { type: "type", name: "boolean" },
    ],
  } */

  parse("[,, 2, 3,,...]"); /* {
    type: "array",
    name: "Array",
    limitless: true,
    items: [
      { type: "type", name: "any" },
      { type: "type", name: "any" },
      { type: "literal", value: 2 },
      { type: "literal", value: 3 },
      { type: "type", name: "any" },
    ],
  } */

  parse("DuckArray[.1,1n,...]"); /* {
    type: "array",
    name: "DuckArray",
    limitless: true,
    items: [
      { type: "literal", value: 0.1 },
      { type: "literal", value: 1n },
    ],
  } */

  /* --------------------------------
   * object
   */

  parse("{}"); /* {
    type: "object",
    name: "Object",
    limitless: false,
    entries: [],
  } */

  parse("{a:1}"); /* {
    type: "object",
    name: "Object",
    limitless: false,
    entries: [["a", { type: "literal", value: 1 }, false]],
  } */

  parse("{...}"); /* {
    type: "object",
    name: "Object",
    limitless: true,
    entries: [],
  } */

  parse("{a: string, 2: true}"); /* {
    type: "object",
    name: "Object",
    limitless: false,
    entries: [
      ["a", { type: "type", name: "string" }, false],
      ["2", { type: "literal", value: true }, false],
    ],
  } */

  parse("{nn?: 'zz', len: number, ...}"); /* {
    type: "object",
    name: "Object",
    limitless: true,
    entries: [
      ["nn", { type: "literal", value: "zz" }, true],
      ["len", { type: "type", name: "number" }, false],
    ],
  } */

  parse('ArrayLike{ 0: 1, 1: 2, length: 2, "zz?":boolean|number, ... }'); /* {
    type: "object",
    name: "ArrayLike",
    limitless: true,
    entries: [
      ["0", { type: "literal", value: 1 }, false],
      ["1", { type: "literal", value: 2 }, false],
      ["length", { type: "literal", value: 2 }, false],
      [
        "zz?",
        {
          type: "union",
          items: [
            { type: "type", name: "boolean" },
            { type: "type", name: "number" },
          ],
        },
        false,
      ],
    ],
  } */

  /* --------------------------------
   * union
   */

  parse("string | true"); /* {
    type: "union",
    items: [
      { type: "type", name: "string" },
      { type: "literal", value: true },
    ],
  } */

  parse("Array|  string[] |5|false | [1,2]"); /* {
    type: "union",
    items: [
      { type: "type", name: "Array" },
      {
        type: "arrayOf",
        name: "Array",
        item: { type: "type", name: "string" },
      },
      { type: "literal", value: 5 },
      { type: "literal", value: false },
      {
        type: "array",
        name: "Array",
        limitless: false,
        items: [
          { type: "literal", value: 1 },
          { type: "literal", value: 2 },
        ],
      },
    ],
  } */

  parse("A[1,,2,3,,...] | `|||` |B{'|?'?:'|',...}|any"); /* {
    type: "union",
    items: [
      {
        type: "array",
        name: "A",
        limitless: true,
        items: [
          { type: "literal", value: 1 },
          { type: "type", name: "any" },
          { type: "literal", value: 2 },
          { type: "literal", value: 3 },
          { type: "type", name: "any" },
        ],
      },
      { type: "literal", value: "|||" },
      {
        type: "object",
        name: "B",
        limitless: true,
        entries: [["|?", { type: "literal", value: "|" }, true]],
      },
      { type: "type", name: "any" },
    ],
  } */
});
