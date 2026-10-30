import { expect, test } from "bun:test";
import { once } from "node:events";
import Redis from "ioredis";
import { Queue, QueueEvents, Worker } from "bullmq";
import { localServices } from "./services";

test("ioredis 5.11.1 runs Lua and pub/sub on isolated keys", async () => {
  const { redis: connection } = await localServices();
  const client = new Redis(connection);
  const subscriber = new Redis(connection);
  const key = `dompis-spike-${crypto.randomUUID()}`;
  const channel = `${key}-events`;
  try {
    expect(await client.ping()).toBe("PONG");
    expect(
      await client.eval("return redis.call('INCR', KEYS[1])", 1, key),
    ).toBe(1);
    expect(await client.get(key)).toBe("1");
    await subscriber.subscribe(channel);
    const received = once(subscriber, "message", {
      signal: AbortSignal.timeout(5_000),
    });
    expect(await client.publish(channel, "synthetic")).toBe(1);
    expect(await received).toEqual([channel, "synthetic"]);
  } finally {
    await subscriber.unsubscribe(channel);
    await client.del(key);
    expect(await client.exists(key)).toBe(0);
    await Promise.all([subscriber.quit(), client.quit()]);
  }
}, 10_000);

test("BullMQ 5.81.1 completes, retries and acknowledges synthetic jobs with concurrency two", async () => {
  const { redis: connection } = await localServices();
  const prefix = `dompis-spike-${crypto.randomUUID()}`;
  const name = "runtime";
  const queue = new Queue(name, { connection, prefix });
  const events = new QueueEvents(name, { connection, prefix });
  let active = 0;
  let peak = 0;
  let release: () => void = () => {};
  const pair = new Promise<void>((resolve) => {
    release = resolve;
  });
  const worker = new Worker(
    name,
    async (job) => {
      if (job.name === "retry" && job.attemptsMade === 0)
        throw new Error("synthetic retry");
      if (job.name === "paired") {
        active += 1;
        peak = Math.max(peak, active);
        if (active === 2) release();
        await pair;
        active -= 1;
      }
      return { value: job.data.value };
    },
    { connection, prefix, concurrency: 2 },
  );
  try {
    await Promise.all([events.waitUntilReady(), worker.waitUntilReady()]);
    const jobs = await queue.addBulk([
      { name: "paired", data: { value: 1 } },
      { name: "paired", data: { value: 2 } },
      {
        name: "retry",
        data: { value: 3 },
        opts: { attempts: 2, backoff: { type: "fixed", delay: 10 } },
      },
    ]);
    const results = await Promise.all(
      jobs.map((job) => job.waitUntilFinished(events, 5_000)),
    );
    expect(results).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
    expect(peak).toBe(2);
    const retry = await queue.getJob(jobs[2]!.id!);
    expect(retry?.attemptsMade).toBe(2);
    expect(await retry?.getState()).toBe("completed");
    expect(
      await queue.getJobCounts("active", "waiting", "failed", "completed"),
    ).toMatchObject({ active: 0, waiting: 0, failed: 0, completed: 3 });
  } finally {
    release();
    await worker.close(true);
    await events.close();
    await queue.obliterate({ force: true });
    await queue.close();
  }
}, 10_000);

test("BullMQ limits a synthetic queue to one start per 300ms window", async () => {
  const { redis: connection } = await localServices();
  const prefix = `dompis-spike-${crypto.randomUUID()}`;
  const queue = new Queue("limited", { connection, prefix });
  const events = new QueueEvents("limited", { connection, prefix });
  const starts: number[] = [];
  const worker = new Worker(
    "limited",
    async () => {
      starts.push(performance.now());
      return "synthetic";
    },
    { connection, prefix, concurrency: 2, limiter: { max: 1, duration: 300 } },
  );
  try {
    await Promise.all([events.waitUntilReady(), worker.waitUntilReady()]);
    const jobs = await queue.addBulk(
      [1, 2, 3].map((value) => ({ name: "limit", data: { value } })),
    );
    await Promise.all(jobs.map((job) => job.waitUntilFinished(events, 5_000)));
    expect(starts).toHaveLength(3);
    expect(starts[1]! - starts[0]!).toBeGreaterThanOrEqual(275);
    expect(starts[2]! - starts[1]!).toBeGreaterThanOrEqual(275);
  } finally {
    await worker.close(true);
    await events.close();
    await queue.obliterate({ force: true });
    await queue.close();
  }
}, 10_000);
