/**
 * acquisition/providers/kie-suno-sounds — Suno's sound generator, through the kie.ai gateway.
 *
 * Answers `sfx` and `ambience`, like the ElevenLabs adapter, and declines music and voice for the
 * same reasons. Verified against a live call on 2026-09-27 (`ai-music-api/sounds`, model V6):
 * 2.5 credits, 19 s, two stereo 48 kHz MP3 takes of 14.2 s and 18.0 s for one request.
 *
 * Three things about this provider shape the code, and all three were found by calling it:
 *
 *   1. NO LENGTH CONTROL. The endpoint takes a prompt, a loop flag, tempo and key — never a
 *      duration. The adapter picks the better of the two takes for the request and sets
 *      `trimToRequest`, so acquisition cuts a one-shot to length from PCM. Loops are never cut.
 *   2. ASYNCHRONOUS. Create a task, poll `recordInfo`, download. Kie reports failure in the body
 *      (`state: "fail"`) and puts its own status code in the body too, with HTTP 200.
 *   3. MALFORMED STATUS JSON. Kie echoes the request back in `param` / `paramJson` with broken
 *      escaping, so `response.json()` throws on a perfectly good result. Those two echo fields
 *      are cut out before parsing; nothing the adapter needs lives in them.
 *
 * LICENCE. This is NOT the ElevenLabs position. The account is Kie's, not a Suno subscription,
 * and kie.ai's Terms of Use (last updated 2025-08-01, read 2026-09-27) say nothing about who owns
 * generated output or whether it may be used commercially. The ledger records exactly that, and
 * the adapter refuses to run until the caller acknowledges it — generating audio for an
 * advertisement on an unrecorded assumption would be worse than failing.
 *
 * SECRET HANDLING. `KIE_API_KEY` is read at call time, sent only as a bearer to api.kie.ai, and
 * never returned, logged or written to provenance. Result files are fetched without it.
 */

import { type AudioProvider, type AudioRequest, type ProviderResult } from "../types";

const API = "https://api.kie.ai/api/v1";
const MODEL = "ai-music-api/sounds";
const TERMS_URL = "https://kie.ai/terms-of-use";
/** The endpoint's own prompt ceiling for a sound task. */
export const MAX_PROMPT_CHARS = 500;

export type SunoModel = "V6" | "V6_MINI" | "V6_WILD";

export type KieSunoSoundsOptions = {
  /**
   * Confirms the caller knows the commercial rights are UNCONFIRMED. Required — see the module
   * note. Replace with a recorded basis once kie.ai has confirmed rights in writing.
   */
  acknowledgeUnconfirmedRights: true;
  /** Injected for testing. Defaults to `globalThis.fetch`. */
  fetchImpl?: typeof fetch;
  /** Injected for testing. Defaults to `process.env.KIE_API_KEY`. */
  apiKey?: string;
  /** Default V6. */
  model?: SunoModel;
  /** Default 5000 ms. */
  pollIntervalMs?: number;
  /** Give up after this long. Default 5 minutes; the live call took 19 s. */
  timeoutMs?: number;
  /** Injected for testing. */
  sleep?: (ms: number) => Promise<void>;
};

/** One take, as Kie describes it. */
export type SoundTake = { id: string; audioUrl: string; durationSeconds: number };

type TaskStatus =
  | { state: "waiting" | "queuing" | "generating" }
  | { state: "success"; takes: SoundTake[] }
  | { state: "fail"; reason: string };

/**
 * Parse a `recordInfo` body despite Kie's broken `param` / `paramJson` echo.
 *
 * Tries the honest parse first, so the workaround costs nothing once Kie fixes its escaping.
 */
export const parseKieStatusBody = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    const repaired = text
      .replace(/"param":".*?",(?="[A-Za-z]+":)/, "")
      .replace(/,"paramJson":".*?"(?=\}\}\s*$)/, "");
    return JSON.parse(repaired);
  }
};

/** Read the takes out of a `resultJson` string, which is itself JSON. */
export const takesFrom = (resultJson: unknown): SoundTake[] => {
  if (typeof resultJson !== "string" || resultJson.trim() === "") return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(resultJson);
  } catch {
    return [];
  }
  const list = (parsed as { data?: unknown } | null)?.data;
  if (!Array.isArray(list)) return [];
  return list.flatMap((entry): SoundTake[] => {
    const e = entry as { id?: unknown; audio_url?: unknown; duration?: unknown };
    return typeof e.audio_url === "string" && typeof e.duration === "number"
      ? [{ id: String(e.id ?? ""), audioUrl: e.audio_url, durationSeconds: e.duration }]
      : [];
  });
};

/**
 * Which take answers the request.
 *
 * A loop cannot be cut, so it gets the take nearest the requested length and verification judges
 * it. A one-shot will be cut, so it gets the SHORTEST take that is still long enough — the least
 * material thrown away — and, if none is long enough, the longest, which verification will then
 * reject by name rather than the adapter hiding the shortfall.
 */
export const chooseTake = (takes: SoundTake[], request: AudioRequest): SoundTake | undefined => {
  if (takes.length === 0) return undefined;
  const target = request.durationSeconds;
  if (request.loop) {
    return [...takes].sort((a, b) => Math.abs(a.durationSeconds - target) - Math.abs(b.durationSeconds - target))[0];
  }
  const longEnough = takes.filter((t) => t.durationSeconds >= target).sort((a, b) => a.durationSeconds - b.durationSeconds);
  return longEnough[0] ?? [...takes].sort((a, b) => b.durationSeconds - a.durationSeconds)[0];
};

/** Build the kie.ai Suno sounds adapter. */
export const kieSunoSoundsProvider = (options: KieSunoSoundsOptions): AudioProvider => {
  const model = options.model ?? "V6";
  const pollIntervalMs = options.pollIntervalMs ?? 5_000;
  const timeoutMs = options.timeoutMs ?? 5 * 60_000;
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));

  return {
    name: "kie-suno-sounds",

    // Music and voice are deliberately out of scope, as for ElevenLabs.
    supports: (request) => request.kind === "sfx" || request.kind === "ambience",

    async acquire(request: AudioRequest): Promise<ProviderResult> {
      if (options.acknowledgeUnconfirmedRights !== true) {
        throw new Error("kie-suno-sounds needs acknowledgeUnconfirmedRights: true — kie.ai's terms do not address commercial use of output.");
      }
      const key = options.apiKey ?? process.env.KIE_API_KEY;
      if (!key) {
        throw new Error(
          "KIE_API_KEY is not set. Add it to the gitignored .env at the repo root; it is never printed or written anywhere else.",
        );
      }
      if (request.description.length > MAX_PROMPT_CHARS) {
        throw new Error(`the sound prompt is ${request.description.length} characters; the endpoint takes at most ${MAX_PROMPT_CHARS}.`);
      }

      const doFetch = options.fetchImpl ?? fetch;
      const auth = { Authorization: `Bearer ${key}` };

      // Surface status and Kie's own code only — an error body can echo the request.
      const refusal = (what: string, status: number, code: unknown, msg: unknown) =>
        new Error(`kie.ai ${what} refused: HTTP ${status}, code ${String(code)}${typeof msg === "string" ? ` ${msg.slice(0, 120)}` : ""}`);

      const created = await doFetch(`${API}/jobs/createTask`, {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL,
          input: { prompt: request.description, model, sound_loop: request.loop },
        }),
      });
      const createBody = (await created.json().catch(() => ({}))) as { code?: unknown; msg?: unknown; data?: { taskId?: unknown } };
      const taskId = createBody.data?.taskId;
      if (!created.ok || createBody.code !== 200 || typeof taskId !== "string") {
        throw refusal("createTask", created.status, createBody.code, createBody.msg);
      }

      let status: TaskStatus = { state: "waiting" };
      const deadline = Date.now() + timeoutMs;
      while (status.state !== "success" && status.state !== "fail") {
        if (Date.now() > deadline) throw new Error(`kie.ai task ${taskId} did not finish within ${timeoutMs / 1000}s`);
        await sleep(pollIntervalMs);
        const polled = await doFetch(`${API}/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`, { headers: auth });
        const body = parseKieStatusBody(await polled.text()) as {
          code?: unknown; msg?: unknown;
          data?: { state?: unknown; resultJson?: unknown; failMsg?: unknown };
        };
        if (!polled.ok || body.code !== 200) throw refusal("recordInfo", polled.status, body.code, body.msg);
        const state = body.data?.state;
        if (state === "success") status = { state, takes: takesFrom(body.data?.resultJson) };
        else if (state === "fail") status = { state, reason: typeof body.data?.failMsg === "string" ? body.data.failMsg : "no reason given" };
        else if (state === "waiting" || state === "queuing" || state === "generating") status = { state };
        // An unknown state is not "still running": that reading polls to the deadline on a task
        // that has already ended some other way.
        else throw new Error(`kie.ai task ${taskId} reported an unknown state ${JSON.stringify(state)}`);
      }
      if (status.state === "fail") throw new Error(`kie.ai task ${taskId} failed: ${status.reason}`);

      const take = chooseTake(status.takes, request);
      if (!take) throw new Error(`kie.ai task ${taskId} succeeded with no downloadable take`);

      // Result URLs are Kie's CDN, not its API: no credential goes with them.
      const audio = await doFetch(take.audioUrl);
      if (!audio.ok) throw new Error(`downloading take ${take.id} returned ${audio.status}`);
      const bytes = new Uint8Array(await audio.arrayBuffer());

      return {
        provider: "kie-suno-sounds",
        providerAssetId: take.id || taskId,
        bytes,
        mime: "audio/mpeg",
        sourceDurationSeconds: take.durationSeconds,
        trimToRequest: true,
        licence: {
          basis:
            "Suno sound via the kie.ai reseller API — commercial rights UNCONFIRMED: kie.ai Terms of Use (2025-08-01) do not address ownership or commercial use of generated output",
          attributionRequired: false,
          termsUrl: TERMS_URL,
          capturedAt: new Date().toISOString(),
        },
        generated: true,
        metadata: {
          model: `${MODEL}:${model}`,
          taskId,
          takesOffered: status.takes.length,
          takeSeconds: take.durationSeconds,
          requestedSeconds: request.durationSeconds,
          loopRequested: request.loop,
        },
      };
    },
  };
};
