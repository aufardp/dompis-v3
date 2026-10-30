import { expect, test } from "bun:test";
import { createServer, type RequestListener } from "node:http";
import { once } from "node:events";

test("adapter-node 6.0.0 serves built SvelteKit on Bun loopback", async () => {
  const entry = new URL("../../apps/web/build/handler.js", import.meta.url)
    .href;
  const adapter: { handler: RequestListener } = await import(entry);
  expect(typeof adapter.handler).toBe("function");
  const server = createServer(adapter.handler);
  try {
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Listener loopback tidak memiliki port TCP");
    }
    const origin = `http://127.0.0.1:${address.port}`;
    const request = (path: string) =>
      fetch(new URL(path, origin), {
        headers: { connection: "close" },
        signal: AbortSignal.timeout(5_000),
      });

    const response = await request("/");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    const html = await response.text();
    expect(html).toContain("<title>Dompis</title>");
    expect(html).toContain("<h1>Dompis</h1>");

    const asset = html.match(/(?:\.\/|\/)_app\/immutable\/entry\/[^"\s)]+\.js/);
    expect(asset).not.toBeNull();
    if (!asset) throw new Error("Aset bootstrap SvelteKit tidak ditemukan");
    const file = await request(asset[0]);
    expect(file.status).toBe(200);
    expect(file.headers.get("content-type")).toContain("javascript");
    expect((await file.text()).length).toBeGreaterThan(0);

    const missing = await request("/synthetic-spike-missing");
    expect(missing.status).toBe(404);
    await missing.arrayBuffer();
  } finally {
    server.closeAllConnections();
    if (server.listening) {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  }
}, 10_000);
