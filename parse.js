function parse(template) {
  const tokens = new Tokens(template);
  const specs = consume(tokens);
  if (tokens.readNext() != null) {
    throw new TypeError(tokens.errorMessage());
  }
  return specs;
}

export default parse;

class Tokens {
  constructor(template) {
    if (typeof template != "string" || !template) {
      throw new TypeError("No template specified");
    }
    this.tokens =
      template.match(/(['"`])[^\1]*?\1|\.\.\.|[-$\w\.]+|\S|\s+/g) ?? [];
    this.cursor = -1;
    this.previous = [];
  }

  readNext() {
    const { tokens, previous } = this;
    previous.push(this.cursor++);
    if (/^\s+$/.test(tokens[this.cursor])) {
      this.cursor++;
    }
    return tokens[this.cursor] ?? null;
  }

  goBack() {
    this.cursor = this.previous.pop() ?? -1;
  }

  errorMessage(message) {
    const { tokens, cursor } = this;
    const token = tokens[cursor];
    if (!message) {
      message =
        token == null ? "Unexpected end of template" : "Unexpected token";
    }
    return `${message} ${token == null ? "" : `'${token}'`}${
      cursor > 0 ? ` at: '${tokens.slice(0, cursor + 1).join("")}'←` : ""
    }`;
  }
}

function consume(tokens) {
  const item = consumeItem(tokens);
  if (tokens.readNext() == "|") {
    const next = consume(tokens);
    return {
      type: "union",
      items: next.type == "union" ? [item, ...next.items] : [item, next],
    };
  }
  tokens.goBack();
  return item;
}

function consumeItem(tokens) {
  const token = tokens.readNext();
  if (token == null) {
    throw new TypeError(tokens.errorMessage());
  }

  // Boolean literal
  if (/^(true|false)$/.test(token)) {
    return {
      type: "literal",
      value: token == "true",
    };
  }

  // BigInt literal
  if (/^-?\d+n$/.test(token)) {
    return {
      type: "literal",
      value: BigInt(token.slice(0, -1)),
    };
  }

  // Numeric literal
  if (/^-?(\d|\.\d)|^NaN$|^-?Infinity$/.test(token)) {
    const n = +token;
    if (isNaN(n) && token != "NaN") {
      throw new TypeError(tokens.errorMessage("Unrecognized numeric literal"));
    }
    return {
      type: "literal",
      value: n,
    };
  }

  // String literal
  if (/^(['"`])[^\1]*?\1$/.test(token)) {
    return {
      type: "literal",
      value: token.slice(1, -1),
    };
  }

  // Type name
  if (/^[a-zA-Z$_][\w$]*$/.test(token)) {
    // Type<type>
    if (tokens.readNext() == "<") {
      const item = consume(tokens);
      if (tokens.readNext() != ">") {
        throw new TypeError(tokens.errorMessage());
      }
      return {
        type: "arrayOf",
        name: token,
        item,
      };
    }
    tokens.goBack();

    // Type{ key: type, key?: type, ... }
    if (tokens.readNext() == "{") {
      return consumeObject(tokens, token);
    }
    tokens.goBack();

    if (tokens.readNext() == "[") {
      // type[]
      if (tokens.readNext() == "]") {
        return {
          type: "arrayOf",
          name: "Array",
          item: {
            type: "type",
            name: token,
          },
        };
      }
      tokens.goBack();

      // Type[ type, type, ... ]
      return consumeArray(tokens, token);
    }
    tokens.goBack();

    // type
    return {
      type: "type",
      name: token,
    };
  }

  // [ type, type, ... ]
  if (token == "[") {
    return consumeArray(tokens, "Array");
  }

  // { key: type, key?: type, ... }
  if (token == "{") {
    return consumeObject(tokens, "Object");
  }

  throw new TypeError(tokens.errorMessage());
}

function consumeArray(tokens, name) {
  const items = [];
  let limitless = false;
  while (true) {
    const token = tokens.readNext();

    if (token == "]") {
      break;
    }

    if (token == "...") {
      limitless = true;
      if (tokens.readNext() != "]") {
        throw new TypeError(tokens.errorMessage());
      }
      break;
    }

    if (token == ",") {
      items.push({ type: "type", name: "any" });
      continue;
    }

    tokens.goBack();
    items.push(consume(tokens));

    const next = tokens.readNext();
    if (next != "," && next != "]") {
      throw new TypeError(tokens.errorMessage());
    }
    if (next == "]") {
      break;
    }
  }
  return {
    type: "array",
    name,
    limitless,
    items,
  };
}

function consumeObject(tokens, name) {
  const entries = [];
  let limitless = false;
  while (true) {
    const token = tokens.readNext();
    let maybe = false;

    if (token == "}") {
      break;
    }

    if (token == "...") {
      limitless = true;
      if (tokens.readNext() != "}") {
        throw new TypeError(tokens.errorMessage());
      }
      break;
    }

    if (token == ",") {
      throw new TypeError(tokens.errorMessage());
    }

    let after = tokens.readNext();
    if (after == "?") {
      maybe = true;
      after = tokens.readNext();
    }
    if (after != ":") {
      throw new TypeError(tokens.errorMessage());
    }

    entries.push([
      /^(['"`]).*\1$/.test(token) ? token.slice(1, -1) : token,
      consume(tokens),
      maybe,
    ]);

    const next = tokens.readNext();
    if (next != "," && next != "}") {
      throw new TypeError(tokens.errorMessage());
    }
    if (next == "}") {
      break;
    }
  }
  return {
    type: "object",
    name,
    limitless,
    entries,
  };
}
