# type-control

`type-control` is a utility which allows you to check the types of values at runtime with a TypeScript like+ type syntax.

## Install

    npm install type-control

## Quick Examples

```js
import { isValidType, assertType } from "type-control";

isValidType("number", 1); // true
isValidType("boolean | string", "foo"); // true
isValidType("none", undefined); // true
isValidType("any, number[], string", false, [2, 3, 4], "bar"); // true
isValidType("Array<number|bigint>", [5, 6, 7n]); // true
isValidType('[boolean, "foo"]', [true, "foo", "bar"]); // false
isValidType('[boolean, "foo", ...]', [true, "foo", "bar"]); // true
isValidType("{ a: number, b: string }", { a: 1, b: "foo" }); // true
isValidType("Error{ message: 'error', ... }", new Error("error")); // true

assertType("string, number", 8, 9); // throws TypeError
```

see [index.test.js](//github.com/undlmn/type-control/blob/master/index.test.js) for more examples.

## Usage

```js
import { isValidType, assertType } from "type-control";
```

### `isValidType("type, type, ...", item, item, ...)`

Checks `item`s value against the `type`s and returns `boolean` - whether the `item`s matches the `type`s.

### `assertType("type, type, ...", item, item, ...)`

Checks `item`s value against the `type`s and throws `TypeError: Type mismatch` if the types does not match.

## Types

### The primitives: `undefined`, `null`, `boolean`, `number`, `bigint`, `string`, `symbol`.

```js
isValidType("number", 1); // true
isValidType("undefined", "foo"); // false
isValidType("symbol", Symbol("bar")); // true
```

### `none`

JavaScript has two primitive values used to signal absent or uninitialized value: `null` and `undefined`.
A special type `none` combines these two types.

```js
isValidType("undefined", undefined); // true
isValidType("null", undefined); // false
isValidType("undefined", null); // false
isValidType("none", undefined); // true
isValidType("none", null); // true
```

### Other types: `function`, `RegExp`, `Error`, `Date`, `Map`, etc...

```js
isValidType("function", () => {}); // true
isValidType("RegExp", /\s*/); // true
isValidType("Error", new Error("error")); // true
isValidType("Date", new Date()); // true
isValidType("Map", new Map()); // true
isValidType("String", new String("foo")); // true
isValidType("string", new String("foo")); // false
isValidType("string", "foo"); // true
```

### `any`

There is also a special type `any`, that you can use whenever you don’t want a particular value to cause typechecking errors.

```js
isValidType("any", 1); // true
isValidType("any", "foo"); // true
isValidType("any", null); // true
```

### Arrays

To specify the type of an array like `[1, 2, 3]`, you can use the syntax `number[]`; this syntax works for any type (e.g. `string[]` is an array of `strings`, and so on). You may also see this written as `Array<number>`, which means the same thing.

```js
isValidType("number[]", [1, 2, 3]); // true
isValidType("boolean[]", [true, false, 4]); // false
isValidType("Array<number>", [5, 6, 7]); // true
```

When an array containing various types:

```js
isValidType("[number, boolean]", [1, true]); // true
isValidType("[number, boolean]", [1, true, 2, 3]); // false
isValidType("[number, boolean, ...]", [1, true, 2, 3]); // true
isValidType("[number, , number]", [1, true, 2]); // true // (eq "[number, any, number]")
isValidType("Array", [1, true, 2]); // true
```

When another array like object is used:

```js
class MyArray extends Array {}

isValidType("MyArray[number, boolean]", new MyArray(1, true)); // true
isValidType("MyArray<boolean>", new MyArray(true, true, false)); // true
isValidType("any[string, boolean, ...]", ["foo", true, 2]); // true
```

### Objects Types

To define an object type, we simply list its properties and their types.

```js
isValidType("{ a: number, b: string }", { a: 1, b: "foo" }); // true
isValidType("{ a: number, b: string }", { a: 1, b: "foo", c: "bar" }); // false
isValidType("{ a: number, b: string, ... }", { a: 1, b: "foo", c: "bar" }); // true
isValidType("{ '!, _ ]': boolean }", { "!, _ ]": true }); // true
```

#### Optional Properties

Object types can also specify that some or all of their properties are _optional_. To do this, add a `?` after the property name:

```js
isValidType("{ a: number; b?: string }", { a: 1 }); // true
isValidType('{ a: number; " "?: string }', { a: 1, " ": "foo" }); // true
```

#### Other objects

```js
class MyArray extends ArrayBuffer {}

isValidType("MyArray{ byteLength: number }", new MyArray()); // true
isValidType("RegExp{ source: '\\s+' }", /\s+/); // true
isValidType('Error{ message: "error" }', new Error("error")); // true
```

### Union Types

A union type is a type formed from two or more other types, representing values that may be any one of these types.

```js
isValidType("number | string", "bar"); // true
isValidType("number | string", 1); // true
isValidType("number | string", null); // false
isValidType("string | string[]", ["foo", "bar"]); // true
```

### Literal Types

In addition to the general types `number`, `string`, etc., we can refer to _specific_ value in type positions.

```js
isValidType('"bar"', "bar"); // true
isValidType("{ a: 'foo' }", { a: "bar" }); // false
isValidType('{ align: "left" | "center" | "right" }', { align: "left" }); // true
isValidType("{ compare: -1 | 0 | 1 }", { compare: 2 }); // false
isValidType("number|`auto`|null", 5); // true
```
