import { argv, version, exit } from "node:process";
import { basename } from "node:path";
import repl from "node:repl";
import { watchFile, unwatchFile } from "node:fs";
import { inspect } from "node:util";

const ALIAS_FOR_DEFAULT = "D";

const createColorTemplate =
  (color) =>
  (a, ...b) =>
    `\x1b[${color}m${a.reduce((a, c, i) => a + b[i - 1] + c)}\x1b[0m`;
const red = createColorTemplate(31);
const green = createColorTemplate(32);
const yellow = createColorTemplate(33);
const cyan = createColorTemplate(36);
const white = createColorTemplate(37);
const gray = createColorTemplate(90);

const isBuildIn = (moduleFilename) => moduleFilename.startsWith("node:");

async function loadModule(moduleFilename, { exitOnError = false } = {}) {
  try {
    return await import(
      moduleFilename + (isBuildIn(moduleFilename) ? "" : "?" + Date.now())
    );
  } catch (error) {
    console.log(red`${error}`);
    exitOnError && exit(1);
  }
}

function copyExports(target, source) {
  if (source != null) {
    for (const [key, value] of Object.entries(source)) {
      target[key == "default" ? value.name || ALIAS_FOR_DEFAULT : key] = value;
    }
  }
  return source;
}

const [, selfFilename, moduleFilename] = argv;

if (moduleFilename == null) {
  console.log(`Use: node ${basename(selfFilename)} <module-filename>`);
  exit();
}

const moduleExports = await loadModule(moduleFilename, { exitOnError: true });

console.log(gray`Node.js ${version}.`);
console.log(white`Loaded module:`, cyan`${moduleFilename}`);
console.log(white`Available exports as variables:`);
console.log(
  Object.keys(moduleExports)
    .map((key) =>
      key == "default"
        ? yellow`default as ` +
          green`${moduleExports[key].name || ALIAS_FOR_DEFAULT}`
        : green`${key}`
    )
    .join(gray`, `)
);
console.log(gray`Type ".reload" for reload module.`);
console.log(gray`Type ".help" for more information.`);

const replServer = repl.start({
  prompt: ">>> ",
  useColors: true,
  preview: true,
  writer: (output) =>
    inspect(output, {
      // showHidden: true,
      depth: 16,
      colors: true,
      // showProxy: true,
      // compact: 8,
      getters: true,
    }),
});

copyExports(replServer.context, moduleExports);

const reload = async () =>
  copyExports(replServer.context, await loadModule(moduleFilename));

replServer.defineCommand("reload", {
  help: `Reload module "${moduleFilename}"`,
  async action() {
    this.clearBufferedCommand();
    (await reload()) && console.log(green`Done`);
    replServer.displayPrompt();
  },
});

async function listener() {
  replServer.clearBufferedCommand();
  console.log();
  (await reload()) && console.log(yellow`Module reloaded`);
  replServer.displayPrompt();
}

if (!isBuildIn(moduleFilename)) {
  watchFile(moduleFilename, listener);
  replServer.on("exit", () => {
    unwatchFile(moduleFilename, listener);
  });
}
