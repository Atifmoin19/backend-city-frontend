import { afterEach, describe, expect, it, vi } from "vitest";

import { api } from "./client";
import { ApiError } from "./errors";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("api client", () => {
  it("parses the backend error envelope", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(json(409, { error: { code: "email_taken", message: "taken" } })),
    );
    await expect(api("/auth/register", { method: "POST", body: {} })).rejects.toMatchObject({
      status: 409,
      code: "email_taken",
    });
  });

  it("retries while the backend cold-starts, then succeeds", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(json(200, { status: "ok" }));
    vi.stubGlobal("fetch", fetchMock);
    const onWaking = vi.fn();
    const promise = api<{ status: string }>("/health", { onWaking });
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toEqual({ status: "ok" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(onWaking).toHaveBeenCalledOnce();
  });

  it("does not retry real rejections", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(json(401, { error: { code: "invalid_credentials", message: "no" } }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(api("/auth/login")).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
