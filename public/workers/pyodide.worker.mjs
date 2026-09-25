// @ts-check
/**
 * Pyodide worker (static ES module, NOT bundled).
 * Why static: Turbopack wraps bundled workers as classic workers, and Pyodide >= 314 only runs in
 * module workers. Message protocol: src/engine/harness/protocol.ts (keep both in sync).
 *
 * Boots Python + FastAPI once, loads the shared harness from /harness, then runs
 * snippet + public tests in-process (no network, no server).
 */

// Must match backend harness/requirements.txt (pinned to this Pyodide release)
const PACKAGES = [
  "pydantic",
  "pydantic_core",
  "typing-extensions",
  "annotated-types",
  "typing-inspection",
  "starlette",
  "anyio",
  "sniffio",
  "idna",
  "annotated-doc",
  "micropip",
];

// Exact wheel from the Pyodide CDN: installing by name resolves lockfile deps (jinja2, httpx...)
const FASTAPI_WHEEL = "fastapi-0.136.1-py3-none-any.whl";

const RUN_SOURCE = `
import json
from harness.splice import splice, SpliceError
from harness.runner import run
try:
    _source = splice(starter, snippet, region)
    _report = await run(_source, json.loads(tests))
except SpliceError as e:
    _report = {"ok": False, "error": str(e), "results": []}
json.dumps(_report, default=str)
`;

/** @type {any} */
let py = null;

/** @param {Record<string, unknown>} msg */
const post = (msg) => self.postMessage(msg);

/** @param {string} pyodideUrl @param {string} harnessBase */
async function init(pyodideUrl, harnessBase) {
  const t0 = performance.now();
  const { loadPyodide } = await import(`${pyodideUrl}pyodide.mjs`);
  const runtime = await loadPyodide({ indexURL: pyodideUrl });
  post({ type: "stage", stage: "runtime", ms: performance.now() - t0 });

  await runtime.loadPackage(PACKAGES, { messageCallback: () => {} });
  await runtime.runPythonAsync(
    `import micropip\nawait micropip.install('${pyodideUrl}${FASTAPI_WHEEL}', deps=False)`,
  );
  post({ type: "stage", stage: "packages", ms: performance.now() - t0 });

  const manifest = await (await fetch(`${harnessBase}/manifest.json`)).json();
  runtime.FS.mkdirTree("/home/pyodide/harness");
  for (const file of manifest.files) {
    const src = await (await fetch(`${harnessBase}/harness/${file}`)).text();
    runtime.FS.writeFile(`/home/pyodide/harness/${file}`, src);
  }
  await runtime.runPythonAsync(
    "import sys\nsys.path.insert(0, '/home/pyodide')\nimport fastapi, pydantic\nimport harness.runner",
  );
  post({ type: "stage", stage: "harness", ms: performance.now() - t0 });
  py = runtime;
  post({ type: "ready", ms: performance.now() - t0 });
}

/** @param {number} id @param {{starterCode: string, snippet: string, region: object, tests: unknown[]}} input */
async function run(id, input) {
  if (!py) throw new Error("Python is not loaded yet");
  const t0 = performance.now();
  const globals = py.toPy({
    starter: input.starterCode,
    snippet: input.snippet,
    region: input.region,
    tests: JSON.stringify(input.tests),
  });
  try {
    const json = await py.runPythonAsync(RUN_SOURCE, { globals });
    post({ type: "result", id, report: JSON.parse(json), ms: performance.now() - t0 });
  } finally {
    globals.destroy();
  }
}

self.onmessage = (event) => {
  const msg = event.data;
  if (msg.type === "init") {
    init(msg.pyodideUrl, msg.harnessBase).catch((e) =>
      post({ type: "init-error", message: e instanceof Error ? e.message : String(e) }),
    );
  } else if (msg.type === "run") {
    run(msg.id, msg.input).catch((e) =>
      post({ type: "run-error", id: msg.id, message: e instanceof Error ? e.message : String(e) }),
    );
  }
};
