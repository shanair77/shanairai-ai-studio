import { describe, expect, it } from "vitest";
import { acquireAssets } from "../acquire";
import { probeWav } from "../verify";
import { trimWav, wrapPcmAsWav } from "../wav";
import {
  chooseTake,
  kieSunoSoundsProvider,
  MAX_PROMPT_CHARS,
  parseKieStatusBody,
  takesFrom,
  type SoundTake,
} from "../providers/kie-suno-sounds";
import type { AcquisitionIO, AudioProvider, AudioRequest } from "../types";

/** The exact `recordInfo` body kie.ai returned for a live call on 2026-09-27 — malformed `param`. */
const LIVE_STATUS_BODY = "{\"code\":200,\"msg\":\"success\",\"data\":{\"taskId\":\"ac44146a580738e4b39a21809f287de3\",\"model\":\"ai-music-api/sounds\",\"state\":\"success\",\"param\":\"{\\\"input\\\":\\\"{\\\\\"sound_loop\\\\\":true,\\\\\"model\\\\\":\\\\\"V6\\\\\",\\\\\"prompt\\\\\":\\\\\"gentle ocean waves on a sandy beach, calm ambience, no music\\\\\"}\\\",\\\"model\\\":\\\"ai-music-api/sounds\\\"}\",\"resultJson\":\"{\\\"code\\\":200,\\\"data\\\":[{\\\"audio_url\\\":\\\"https://tempfile.aiquickdraw.com/r/52cc0e1a-b580-47db-922d-6ba55b7d84f1.mp3\\\",\\\"createTime\\\":1790546580394,\\\"duration\\\":14.2,\\\"id\\\":\\\"52cc0e1a-b580-47db-922d-6ba55b7d84f1\\\",\\\"image_url\\\":\\\"https://cdn2.suno.ai/image_52cc0e1a-b580-47db-922d-6ba55b7d84f1.jpeg\\\",\\\"model_name\\\":\\\"chirp-hawk\\\",\\\"prompt\\\":\\\"\\\",\\\"stream_audio_url\\\":\\\"https://audiostream.kie.ai/stream/52cc0e1a-b580-47db-922d-6ba55b7d84f1.mp3\\\",\\\"tags\\\":\\\"gentle ocean waves on a sandy beach, calm ambience, no music\\\",\\\"title\\\":\\\"gentle ocean waves on a sandy beach, calm ambience, no music\\\"},{\\\"audio_url\\\":\\\"https://tempfile.aiquickdraw.com/r/2ca479bd-ea6b-4b63-bb81-17711f87e34f.mp3\\\",\\\"createTime\\\":1790546580394,\\\"duration\\\":17.96,\\\"id\\\":\\\"2ca479bd-ea6b-4b63-bb81-17711f87e34f\\\",\\\"image_url\\\":\\\"https://cdn2.suno.ai/image_2ca479bd-ea6b-4b63-bb81-17711f87e34f.jpeg\\\",\\\"model_name\\\":\\\"chirp-hawk\\\",\\\"prompt\\\":\\\"\\\",\\\"stream_audio_url\\\":\\\"https://audiostream.kie.ai/stream/2ca479bd-ea6b-4b63-bb81-17711f87e34f.mp3\\\",\\\"tags\\\":\\\"gentle ocean waves on a sandy beach, calm ambience, no music\\\",\\\"title\\\":\\\"gentle ocean waves on a sandy beach, calm ambience, no music\\\"}],\\\"msg\\\":\\\"success\\\",\\\"task_id\\\":\\\"ac44146a580738e4b39a21809f287de3\\\"}\",\"failCode\":null,\"failMsg\":null,\"costTime\":19,\"completeTime\":1790546580394,\"createTime\":1790546560633,\"creditsConsumed\":2.5,\"operationType\":\"ai-music-api/sounds\",\"status\":\"SUCCESS\",\"type\":\"chirp-hawk\",\"parentMusicId\":\"\",\"response\":{\"msg\":\"success\",\"code\":200,\"data\":[{\"duration\":14.2,\"stream_audio_url\":\"https://audiostream.kie.ai/stream/52cc0e1a-b580-47db-922d-6ba55b7d84f1.mp3\",\"model_name\":\"chirp-hawk\",\"createTime\":1790546580394,\"image_url\":\"https://cdn2.suno.ai/image_52cc0e1a-b580-47db-922d-6ba55b7d84f1.jpeg\",\"audio_url\":\"https://tempfile.aiquickdraw.com/r/52cc0e1a-b580-47db-922d-6ba55b7d84f1.mp3\",\"id\":\"52cc0e1a-b580-47db-922d-6ba55b7d84f1\",\"title\":\"gentle ocean waves on a sandy beach, calm ambience, no music\",\"prompt\":\"\",\"tags\":\"gentle ocean waves on a sandy beach, calm ambience, no music\"},{\"duration\":17.96,\"stream_audio_url\":\"https://audiostream.kie.ai/stream/2ca479bd-ea6b-4b63-bb81-17711f87e34f.mp3\",\"model_name\":\"chirp-hawk\",\"createTime\":1790546580394,\"image_url\":\"https://cdn2.suno.ai/image_2ca479bd-ea6b-4b63-bb81-17711f87e34f.jpeg\",\"audio_url\":\"https://tempfile.aiquickdraw.com/r/2ca479bd-ea6b-4b63-bb81-17711f87e34f.mp3\",\"id\":\"2ca479bd-ea6b-4b63-bb81-17711f87e34f\",\"title\":\"gentle ocean waves on a sandy beach, calm ambience, no music\",\"prompt\":\"\",\"tags\":\"gentle ocean waves on a sandy beach, calm ambience, no music\"}],\"task_id\":\"ac44146a580738e4b39a21809f287de3\"},\"successFlag\":1,\"paramJson\":\"{\\\"input\\\":\\\"{\\\\\"sound_loop\\\\\":true,\\\\\"model\\\\\":\\\\\"V6\\\\\",\\\\\"prompt\\\\\":\\\\\"gentle ocean waves on a sandy beach, calm ambience, no music\\\\\"}\\\",\\\"model\\\":\\\"ai-music-api/sounds\\\"}\"}}";

const steadyWav = (seconds: number, sr = 8000) => {
  const frames = Math.round(seconds * sr);
  const pcm = new Uint8Array(frames * 2);
  const view = new DataView(pcm.buffer);
  for (let i = 0; i < frames; i++) view.setInt16(i * 2, Math.round(Math.sin(i * 0.05) * 0.5 * 32767), true);
  return wrapPcmAsWav(pcm, sr, 1);
};

const io = (): AcquisitionIO & { files: Map<string, Uint8Array> } => {
  const files = new Map<string, Uint8Array>();
  return { files, write: (p, b) => void files.set(p, b), read: (p) => files.get(p)!, now: () => "2026-09-27T00:00:00.000Z" };
};

const req = (over: Partial<AudioRequest> = {}): AudioRequest => ({
  key: "sfxKnock", kind: "sfx", description: "a single soft wooden knock", durationSeconds: 2, loop: false, ...over,
});

const take = (id: string, durationSeconds: number): SoundTake => ({ id, audioUrl: `https://cdn.example/${id}.mp3`, durationSeconds });

const KEY = "test-key-never-to-appear";
const resultJson = (takes: { id: string; duration: number }[]) =>
  JSON.stringify({ code: 200, data: takes.map((t) => ({ id: t.id, audio_url: `https://cdn.example/${t.id}.mp3`, duration: t.duration })) });

/** A kie.ai double that records every request and answers from a script of task states. */
const fakeKie = (states: Array<{ state: string; resultJson?: string; failMsg?: string }>, createCode = 200) => {
  const calls: { url: string; init?: RequestInit }[] = [];
  let poll = 0;
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init });
    if (url.endsWith("/jobs/createTask")) {
      return new Response(JSON.stringify({ code: createCode, msg: createCode === 200 ? "success" : "refused", data: createCode === 200 ? { taskId: "task1" } : null }));
    }
    if (url.includes("/jobs/recordInfo")) {
      const s = states[Math.min(poll++, states.length - 1)];
      // Reproduce the broken echo on every answer, as the live service does.
      return new Response(
        `{"code":200,"msg":"success","data":{"taskId":"task1","state":"${s.state}","param":"{\\"input\\":\\"{\\\\"prompt\\\\":1}\\"}","resultJson":${JSON.stringify(s.resultJson ?? "")},"failMsg":${JSON.stringify(s.failMsg ?? null)}}}`,
      );
    }
    return new Response(new Uint8Array([0xff, 0xfb, 0x90, 0x00]), { status: 200 });
  }) as typeof fetch;
  return { fetchImpl, calls };
};

const provider = (fetchImpl: typeof fetch, over: object = {}) =>
  kieSunoSoundsProvider({ acknowledgeUnconfirmedRights: true, apiKey: KEY, fetchImpl, pollIntervalMs: 0, sleep: async () => {}, ...over });

describe("parseKieStatusBody", () => {
  it("reads the live malformed reply that response.json() rejects", () => {
    expect(() => JSON.parse(LIVE_STATUS_BODY)).toThrow();
    const body = parseKieStatusBody(LIVE_STATUS_BODY) as { data: { state: string; resultJson: string } };
    expect(body.data.state).toBe("success");
    expect(takesFrom(body.data.resultJson).map((t) => t.durationSeconds)).toEqual([14.2, 17.96]);
  });

  it("parses a well-formed body without touching it", () => {
    expect(parseKieStatusBody('{"code":200,"data":{"state":"generating"}}')).toEqual({ code: 200, data: { state: "generating" } });
  });
});

describe("chooseTake", () => {
  const takes = [take("a", 14.2), take("b", 17.96)];

  it("gives a one-shot the shortest take that is long enough", () => {
    expect(chooseTake(takes, req({ durationSeconds: 2 }))?.id).toBe("a");
    expect(chooseTake(takes, req({ durationSeconds: 16 }))?.id).toBe("b");
  });

  it("gives a one-shot the longest take when none is long enough, for verification to reject", () => {
    expect(chooseTake(takes, req({ durationSeconds: 30 }))?.id).toBe("b");
  });

  it("gives a loop the take nearest the requested length", () => {
    expect(chooseTake(takes, req({ kind: "ambience", loop: true, durationSeconds: 17 }))?.id).toBe("b");
    expect(chooseTake(takes, req({ kind: "ambience", loop: true, durationSeconds: 8 }))?.id).toBe("a");
  });

  it("has nothing to choose from an empty result", () => {
    expect(chooseTake([], req())).toBeUndefined();
  });
});

describe("kieSunoSoundsProvider", () => {
  it("answers sfx and ambience and declines music and voice", () => {
    const p = provider(fakeKie([]).fetchImpl);
    expect(p.supports(req({ kind: "sfx" }))).toBe(true);
    expect(p.supports(req({ kind: "ambience" }))).toBe(true);
    expect(p.supports(req({ kind: "music" }))).toBe(false);
    expect(p.supports(req({ kind: "voice" }))).toBe(false);
  });

  it("creates, polls through the malformed echo, and downloads the chosen take", async () => {
    const kie = fakeKie([
      { state: "queuing" },
      { state: "generating" },
      { state: "success", resultJson: resultJson([{ id: "short", duration: 14.2 }, { id: "long", duration: 17.96 }]) },
    ]);
    const r = await provider(kie.fetchImpl).acquire(req({ kind: "ambience", loop: true, durationSeconds: 18 }));

    const create = JSON.parse(String(kie.calls[0].init?.body));
    expect(create).toEqual({ model: "ai-music-api/sounds", input: { prompt: "a single soft wooden knock", model: "V6", sound_loop: true } });
    expect(kie.calls.filter((c) => c.url.includes("recordInfo"))).toHaveLength(3);
    expect(kie.calls[kie.calls.length - 1]?.url).toBe("https://cdn.example/long.mp3");

    expect(r.provider).toBe("kie-suno-sounds");
    expect(r.providerAssetId).toBe("long");
    expect(r.mime).toBe("audio/mpeg");
    expect(r.sourceDurationSeconds).toBe(17.96);
    expect(r.trimToRequest).toBe(true);
    expect(r.generated).toBe(true);
    expect(r.licence.basis).toMatch(/UNCONFIRMED/);
    expect(r.licence.termsUrl).toBe("https://kie.ai/terms-of-use");
  });

  it("sends the key only to kie.ai, never to the result CDN, and never records it", async () => {
    const kie = fakeKie([{ state: "success", resultJson: resultJson([{ id: "t", duration: 14 }]) }]);
    const r = await provider(kie.fetchImpl).acquire(req());
    for (const call of kie.calls) {
      const auth = new Headers(call.init?.headers).get("authorization");
      if (call.url.startsWith("https://api.kie.ai/")) expect(auth).toBe(`Bearer ${KEY}`);
      else expect(auth).toBeNull();
    }
    expect(JSON.stringify({ ...r, bytes: undefined })).not.toContain(KEY);
  });

  it("refuses to run without acknowledging the unconfirmed rights", async () => {
    const kie = fakeKie([]);
    const p = kieSunoSoundsProvider({ acknowledgeUnconfirmedRights: false as unknown as true, apiKey: KEY, fetchImpl: kie.fetchImpl });
    await expect(p.acquire(req())).rejects.toThrow(/acknowledgeUnconfirmedRights/);
    expect(kie.calls).toHaveLength(0);
  });

  it("refuses without a key, and says where it goes without asking for it", async () => {
    const kie = fakeKie([]);
    const saved = process.env.KIE_API_KEY;
    delete process.env.KIE_API_KEY;
    try {
      await expect(provider(kie.fetchImpl, { apiKey: undefined }).acquire(req())).rejects.toThrow(/KIE_API_KEY is not set/);
    } finally {
      if (saved !== undefined) process.env.KIE_API_KEY = saved;
    }
    expect(kie.calls).toHaveLength(0);
  });

  it("refuses a prompt over the endpoint's limit before spending anything", async () => {
    const kie = fakeKie([]);
    await expect(provider(kie.fetchImpl).acquire(req({ description: "x".repeat(MAX_PROMPT_CHARS + 1) }))).rejects.toThrow(/at most 500/);
    expect(kie.calls).toHaveLength(0);
  });

  it("reports kie.ai's own refusal code from a 200 response", async () => {
    await expect(provider(fakeKie([], 402).fetchImpl).acquire(req())).rejects.toThrow(/code 402/);
  });

  it("surfaces a failed task with Kie's reason", async () => {
    const kie = fakeKie([{ state: "fail", failMsg: "Internal Error, Please try again later." }]);
    await expect(provider(kie.fetchImpl).acquire(req())).rejects.toThrow(/failed: Internal Error/);
  });

  it("does not mistake an unknown state for a running one", async () => {
    const kie = fakeKie([{ state: "exploded" }]);
    await expect(provider(kie.fetchImpl).acquire(req())).rejects.toThrow(/unknown state "exploded"/);
  });

  it("gives up at the deadline", async () => {
    const kie = fakeKie([{ state: "generating" }]);
    await expect(provider(kie.fetchImpl, { timeoutMs: -1 }).acquire(req())).rejects.toThrow(/did not finish/);
  });
});

describe("trimWav", () => {
  it("cuts to the requested length and fades the last sample to silence", () => {
    const { bytes, trimmed } = trimWav(steadyWav(6), 2);
    expect(trimmed).toBe(true);
    const probe = probeWav(bytes)!;
    expect(probe.durationSeconds).toBeCloseTo(2, 3);
    expect(new DataView(bytes.buffer, bytes.byteOffset).getInt16(bytes.length - 2, true)).toBe(0);
  });

  it("only ever shortens", () => {
    const wav = steadyWav(2);
    expect(trimWav(wav, 5)).toEqual({ bytes: wav, trimmed: false });
  });
});

describe("acquireAssets with a provider that cannot control length", () => {
  const overlong = (seconds: number, trimToRequest: boolean): AudioProvider => ({
    name: "overlong",
    supports: () => true,
    acquire: async () => ({
      provider: "overlong", providerAssetId: "x", bytes: steadyWav(seconds), mime: "audio/wav",
      sourceDurationSeconds: seconds, trimToRequest,
      licence: { basis: "test", attributionRequired: false, capturedAt: "2026-09-27T00:00:00.000Z" },
      generated: true,
    }),
  });

  it("cuts a one-shot to the request and keeps both lengths in the record", async () => {
    const r = await acquireAssets([req({ durationSeconds: 2 })], [overlong(14, true)], io());
    expect(r.accepted).toHaveLength(1);
    expect(r.accepted[0].sourceDurationSeconds).toBe(14);
    expect(r.accepted[0].finalDurationSeconds).toBeCloseTo(2, 2);
  });

  it("never cuts a loop", async () => {
    const r = await acquireAssets([req({ kind: "ambience", loop: true, durationSeconds: 2 })], [overlong(14, true)], io());
    expect(r.records[0].finalDurationSeconds).toBeCloseTo(14, 2);
    expect(r.records[0].verdict).toBe("rejected");
  });

  it("leaves a provider that honours length alone", async () => {
    const r = await acquireAssets([req({ durationSeconds: 2 })], [overlong(14, false)], io());
    expect(r.records[0].finalDurationSeconds).toBeCloseTo(14, 2);
    expect(r.records[0].verdict).toBe("rejected");
  });
});
