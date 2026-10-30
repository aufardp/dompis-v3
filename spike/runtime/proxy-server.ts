import { Elysia, sse } from "elysia";

let release: () => void = () => {};
const gate = new Promise<void>((resolve) => {
  release = resolve;
});

new Elysia()
  .get("/ready", () => ({ ready: true, bun: Bun.version }))
  .post("/release", () => {
    release();
    return { released: true };
  })
  .get("/events", async function* () {
    yield sse({ event: "spike", data: { count: 1 } });
    await gate;
    yield sse({ event: "spike", data: { count: 2 } });
  })
  .listen({ hostname: "127.0.0.1", port: 3000 });
