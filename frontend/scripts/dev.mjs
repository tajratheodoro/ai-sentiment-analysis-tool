import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(frontendRoot, "..");
const pythonCommand = process.env.PYTHON ?? "python";
const apiUrl = "http://127.0.0.1:8000/api/health";

const children = new Set();

function run(command, args, options) {
  const child = spawn(command, args, {
    ...options,
    stdio: "inherit",
  });

  children.add(child);
  child.once("exit", () => children.delete(child));
  return child;
}

function stopAll(signal = "SIGTERM") {
  for (const child of children) {
    if (!child.killed) child.kill(signal);
  }
}

async function waitForApi() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (await isApiReady()) return;
    await delay(500);
  }

  throw new Error("FastAPI backend did not become ready on http://127.0.0.1:8000.");
}

async function isApiReady() {
  try {
    const response = await fetch(apiUrl);
    return response.ok;
  } catch {
    return false;
  }
}

process.once("SIGINT", () => {
  stopAll("SIGINT");
  process.exit(130);
});

process.once("SIGTERM", () => {
  stopAll("SIGTERM");
  process.exit(143);
});

if (!(await isApiReady())) {
  const api = run(
    pythonCommand,
    ["-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000"],
    { cwd: repoRoot },
  );

  api.once("exit", (code) => {
    stopAll();
    process.exit(code ?? 1);
  });
}

try {
  await waitForApi();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  stopAll();
  process.exit(1);
}

const nextBin = path.join(frontendRoot, "node_modules", "next", "dist", "bin", "next");
const next = run(process.execPath, [nextBin, "dev"], { cwd: frontendRoot });

next.once("exit", (code) => {
  stopAll();
  process.exit(code ?? 1);
});
