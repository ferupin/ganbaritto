import { describe, expect, it } from "vitest";
import { storeFor } from "./store";

describe("store da prova", () => {
  it("um store por prova, sem misturar respostas", () => {
    const a = storeFor("a");
    const b = storeFor("b");
    a.getState().setAnswer("q1", "c");
    expect(a.getState().attempt.answers).toEqual({ q1: "c" });
    expect(b.getState().attempt.answers).toEqual({});
    expect(storeFor("a")).toBe(a);
  });
  it("finish trava e reset começa de novo", () => {
    const s = storeFor("x");
    s.getState().setAnswer("q1", "a");
    s.getState().finish();
    expect(s.getState().attempt.finished).toBe(true);
    s.getState().reset();
    expect(s.getState().attempt.finished).toBe(false);
    expect(s.getState().attempt.answers).toEqual({});
  });
});
