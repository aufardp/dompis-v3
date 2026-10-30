import { describe, expect, test } from "bun:test";
import { AsyncLocalStorage } from "node:async_hooks";
import { compare, hash } from "bcryptjs";
import { Elysia, sse } from "elysia";
import { jwtVerify, SignJWT } from "jose";
import { createTask, validate } from "node-cron";
import { z } from "zod";
import reference from "./reference.json";

const key = Uint8Array.from(reference.key);
const currentDate = new Date(reference.now);
const issuedAt = currentDate.getTime() / 1000;
const jwtOptions = { algorithms: ["HS256"], currentDate };

describe("jose 6.2.3 on Bun", () => {
  test("verifies a synthetic HS256 token signed on Node", async () => {
    const { payload, protectedHeader } = await jwtVerify(
      reference.token,
      key,
      jwtOptions,
    );
    expect(protectedHeader.alg).toBe("HS256");
    expect(payload).toMatchObject(reference.claims);
    expect(typeof payload.id_user).toBe("number");
  });

  test("rejects a wrong key", async () => {
    await expect(
      jwtVerify(reference.token, new Uint8Array(32).fill(20), jwtOptions),
    ).rejects.toThrow();
  });

  test("rejects an expired token with an injected clock", async () => {
    await expect(
      jwtVerify(reference.token, key, {
        ...jwtOptions,
        currentDate: new Date(currentDate.getTime() + 61_000),
      }),
    ).rejects.toThrow();
  });

  test("signs on Bun and verifies claims", async () => {
    const token = await new SignJWT(reference.claims)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(issuedAt)
      .setExpirationTime(issuedAt + 60)
      .sign(key);
    expect((await jwtVerify(token, key, jwtOptions)).payload).toMatchObject(
      reference.claims,
    );
  });

  test("rejects an algorithm outside the allowlist", async () => {
    const token = await new SignJWT(reference.claims)
      .setProtectedHeader({ alg: "HS384" })
      .setExpirationTime(issuedAt + 60)
      .sign(key);
    await expect(jwtVerify(token, key, jwtOptions)).rejects.toThrow();
  });
});

describe("bcryptjs 3.0.3 on Bun", () => {
  test("verifies the synthetic Node hash", async () => {
    expect(await compare(reference.password, reference.hash)).toBe(true);
  });

  test("rejects a different password", async () => {
    expect(await compare(reference.password + "-wrong", reference.hash)).toBe(
      false,
    );
  });

  test("produces the same hash for the fixed fixture salt", async () => {
    expect(await hash(reference.password, reference.hash)).toBe(reference.hash);
  });
});

describe("zod 4.6.6 on Bun", () => {
  const schema = z.object({ count: z.number().int() }).strict();

  test("preserves a numeric JSON field", () => {
    expect(schema.parse({ count: 1 })).toEqual({ count: 1 });
  });

  test("rejects strings, null and unexpected fields", () => {
    for (const input of [{ count: "1" }, { count: null }, { count: 1, x: 2 }]) {
      expect(schema.safeParse(input).success).toBe(false);
    }
  });
});

describe("node-cron 4.2.1 on Bun", () => {
  test("validates expressions without starting a scheduler", () => {
    expect(validate("0 3 * * *")).toBe(true);
    expect(validate("61 * * * *")).toBe(false);
  });

  test("executes and destroys an isolated stopped task", async () => {
    let runs = 0;
    const task = createTask("0 3 * * *", () => ++runs, {
      timezone: "Asia/Jakarta",
    });
    try {
      expect(task.getStatus()).toBe("stopped");
      await task.execute();
      expect(runs).toBe(1);
    } finally {
      await task.destroy();
    }
    expect(task.getStatus()).toBe("destroyed");
  });
});

describe("AsyncLocalStorage on Bun", () => {
  test("isolates concurrent contexts across awaits", async () => {
    const context = new AsyncLocalStorage<string>();
    try {
      const values = await Promise.all(
        ["synthetic-a", "synthetic-b"].map((id) =>
          context.run(id, async () => {
            await Promise.resolve();
            return context.getStore();
          }),
        ),
      );
      expect(values).toEqual(["synthetic-a", "synthetic-b"]);
      expect(context.getStore()).toBeUndefined();
    } finally {
      context.disable();
    }
  });

  test("restores the outer context after a nested run", () => {
    const context = new AsyncLocalStorage<string>();
    try {
      context.run("outer", () => {
        context.run("inner", () => expect(context.getStore()).toBe("inner"));
        expect(context.getStore()).toBe("outer");
      });
      expect(context.getStore()).toBeUndefined();
    } finally {
      context.disable();
    }
  });
});

describe("Elysia 1.4.30 in-process on Bun", () => {
  test("validates a synthetic JSON request through Zod", async () => {
    const app = new Elysia().post("/spike", ({ body }) => body, {
      body: z.object({ count: z.number().int() }),
    });
    const send = (count: unknown) =>
      app.handle(
        new Request("http://spike.invalid/spike", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ count }),
        }),
      );
    const valid = await send(1);
    expect(valid.status).toBe(200);
    expect(await valid.json()).toEqual({ count: 1 });
    expect((await send("1")).status).toBe(422);
  });

  test("formats a finite SSE stream without a listener", async () => {
    const app = new Elysia().get("/events", function* () {
      yield sse({ event: "spike", data: { count: 1 } });
      yield sse({ event: "spike", data: { count: 2 } });
    });
    const response = await app.handle(
      new Request("http://spike.invalid/events"),
    );
    expect(response.headers.get("content-type")).toContain("text/event-stream");
    const body = await response.text();
    expect(body).toContain('data: {"count":1}');
    expect(body).toContain('data: {"count":2}');
    expect(body.match(/event: spike/g)).toHaveLength(2);
  });
});
