async function tester(fn) {
  const { throws, doesNotThrow, strictSame } = await import("tap");

  const lines = fn
    .toString()
    .replace(/^[^{]+{|}\s*$/g, "")
    .replace(
      /\/\*([\s\S]*?)\*\//g,
      (_, s) => `// ${s.replace(/\s*\n\s*/g, " ").trim()}`
    )
    .split(/\n/)
    .map((line) => line.trim())
    .filter((line) => line)
    .map((line) => line.split(/\s*\/\/\s*/));

  for (const [command, expected] of lines) {
    if (!command) continue;

    if (!expected) {
      doesNotThrow(
        () => eval(command),
        `${command} should not throw an exception`
      );
      continue;
    }

    if (/^throws/i.test(expected)) {
      const exception = expected.slice(6).trim();
      throws(
        () => eval(command),
        eval(`(${exception})`),
        `${command} should throw ${exception || "an exception"}`
      );
      continue;
    }

    strictSame(
      eval(command),
      eval(`(${expected})`),
      `${command} should return ${expected}`
    );
  }
}

export default tester;
