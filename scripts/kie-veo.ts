/**
 * One Veo 3.1 render through the kie.ai gateway.
 *
 *   npm run kie:veo -- "a single matcha bowl on dark stone, slow steam rising"
 *   npm run kie:veo -- --seconds=5 --aspect=9:16 --model=veo3_fast "prompt..."
 *
 * Reads KIE_API_KEY from the environment or from the gitignored `.env`. The key is never
 * printed and never written to disk.
 *
 * Veo 3.1 sells 4, 6 or 8 s clips (kie.ai docs, /api/v1/veo/generate `duration`). `--seconds` asks
 * for the shortest of those at or above it and trims the rest locally with ffmpeg (the system one if
 * it is on PATH, else Remotion's). The untrimmed original is kept next to it.
 *
 * Output lands in takes/kie/ (gitignored). This is a PRE-RENDER step: Remotion never calls it.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const API = "https://api.kie.ai/api/v1";
const OUT_DIR = join(ROOT, "takes/kie");

/** Same rules as scripts/acquire-jetset-audio.ts: real env beats the file, last line wins. */
const loadEnv = (): void => {
  const file = join(ROOT, ".env");
  if (!existsSync(file)) return;
  const parsed = new Map<string, string>();
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) parsed.set(m[1], m[2].replace(/^["']|["']$/g, ""));
  }
  for (const [k, v] of parsed) if (process.env[k] === undefined) process.env[k] = v;
};

type KieEnvelope<T> = { code: number; msg: string; data: T };

const call = async <T>(key: string, path: string, body?: unknown): Promise<T> => {
  const res = await fetch(`${API}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json: KieEnvelope<T>;
  try {
    json = JSON.parse(text) as KieEnvelope<T>;
  } catch {
    throw new Error(`kie.ai ${path} -> HTTP ${res.status}, not JSON: ${text.slice(0, 120)}`);
  }
  if (!res.ok || json.code !== 200) {
    throw new Error(`kie.ai ${path} -> HTTP ${res.status}, code ${json.code}: ${json.msg}`);
  }
  return json.data;
};

type VeoRecord = {
  successFlag: 0 | 1 | 2 | 3; // 0 generating, 1 success, 2/3 failed
  errorMessage?: string | null;
  response?: { resultUrls?: string[] } | null;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const main = async (): Promise<void> => {
  loadEnv();
  const key = process.env.KIE_API_KEY;
  if (!key) {
    console.error(
      "\nKIE_API_KEY is not set.\n" +
        "  Add it to the gitignored .env at the repo root:  KIE_API_KEY=your_key\n" +
        "  Create one at kie.ai -> API Keys.\n",
    );
    process.exit(1);
  }

  const argv = process.argv.slice(2);
  const flag = (name: string, fallback: string) =>
    argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
  const prompt = argv.filter((a) => !a.startsWith("--")).join(" ").trim();
  if (!prompt) {
    console.error('Usage: npm run kie:veo -- [--seconds=5] [--aspect=9:16] [--model=veo3_fast] "prompt"');
    process.exit(1);
  }
  const seconds = Number(flag("seconds", "5"));
  const aspectRatio = flag("aspect", "9:16");
  const model = flag("model", "veo3_fast");
  if (!Number.isFinite(seconds) || seconds <= 0 || seconds > 8) {
    console.error("--seconds must be between 0 and 8 (Veo 3.1 makes 4, 6 or 8 s clips)");
    process.exit(1);
  }
  const duration = [4, 6, 8].find((tier) => tier >= seconds) ?? 8;

  const credits = await call<number>(key, "/chat/credit");
  console.log(`kie.ai balance: ${credits} credits`);

  const { taskId } = await call<{ taskId: string }>(key, "/veo/generate", {
    prompt,
    model,
    // snake_case per the docs; the camelCase spelling is ignored and Veo falls back to 16:9.
    aspect_ratio: aspectRatio,
    duration,
  });
  console.log(`Submitted ${model} ${aspectRatio} ${duration}s: task ${taskId}`);

  let url: string | undefined;
  for (let i = 0; i < 120 && !url; i++) {
    await sleep(10_000);
    const rec = await call<VeoRecord>(key, `/veo/record-info?taskId=${encodeURIComponent(taskId)}`);
    if (rec.successFlag === 1) url = rec.response?.resultUrls?.[0];
    else if (rec.successFlag >= 2) throw new Error(`Render failed: ${rec.errorMessage ?? "no reason given"}`);
    else process.stdout.write(".");
  }
  if (!url) throw new Error(`Timed out waiting for task ${taskId}`);
  console.log(`\nResult URL: ${url}`);

  mkdirSync(OUT_DIR, { recursive: true });
  const full = join(OUT_DIR, `${taskId}-full.mp4`);
  writeFileSync(full, new Uint8Array(await (await fetch(url)).arrayBuffer()));
  const trimmed = join(OUT_DIR, `${taskId}-${seconds}s.mp4`);
  const trimArgs = ["-y", "-i", full, "-t", String(seconds), "-c:v", "libx264", "-crf", "16", "-c:a", "aac", trimmed];
  let systemFfmpeg = true;
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
  } catch {
    systemFfmpeg = false;
  }
  execFileSync(systemFfmpeg ? "ffmpeg" : "npx", systemFfmpeg ? trimArgs : ["remotion", "ffmpeg", ...trimArgs], {
    stdio: "ignore",
    cwd: ROOT,
  });
  console.log(`Saved: ${full}\nTrimmed: ${trimmed}`);
  console.log(`Balance after: ${await call<number>(key, "/chat/credit")} credits`);
};

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
