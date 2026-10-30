import { expect, test } from "bun:test";
import { resolve } from "node:path";

async function docker(args: string[]) {
  const process = Bun.spawn(["docker", ...args], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, code] = await Promise.all([
    new Response(process.stdout).text(),
    new Response(process.stderr).text(),
    process.exited,
  ]);
  if (code !== 0) throw new Error(`Docker fixture failed (${code}): ${stderr}`);
  return stdout.trim();
}

test("Elysia SSE flushes through Nginx before the second event is released", async () => {
  const name = `dompis-spike-sse-${crypto.randomUUID()}`;
  const root = resolve(import.meta.dir, "../..");
  const image =
    "sha256:47928bf67eb62a1863cb08d9ecb52d3e704304ba614eaee17884204677702951";
  let created = false;
  const controller = new AbortController();
  let cancelReader: (() => Promise<void>) | undefined;
  try {
    await docker([
      "run",
      "--detach",
      "--rm",
      "--name",
      name,
      "--label",
      "dompis.scope=foundation-sse-spike",
      "--publish",
      "127.0.0.1::8080",
      "--mount",
      `type=bind,src=${root}/.cache/toolchain/bun-linux-aarch64-musl/bun,dst=/tool/bun,readonly`,
      "--mount",
      `type=bind,src=${root}/node_modules,dst=/work/node_modules,readonly`,
      "--mount",
      `type=bind,src=${root}/spike/runtime/proxy-server.ts,dst=/work/server.ts,readonly`,
      "--mount",
      `type=bind,src=${root}/spike/proxy/nginx.conf,dst=/etc/nginx/nginx.conf,readonly`,
      "--entrypoint",
      "sh",
      image,
      "-c",
      '/tool/bun --no-env-file /work/server.ts & exec nginx -g "daemon off;"',
    ]);
    created = true;
    const inspect = JSON.parse(await docker(["inspect", name]))[0];
    const published = inspect.NetworkSettings.Ports["8080/tcp"][0];
    expect(published.HostIp).toBe("127.0.0.1");
    const origin = `http://127.0.0.1:${published.HostPort}`;
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      try {
        const response = await fetch(`${origin}/ready`, {
          signal: AbortSignal.timeout(500),
        });
        if (response.ok) {
          expect(await response.json()).toEqual({ ready: true, bun: "1.4.4" });
          ready = true;
          break;
        }
        await response.arrayBuffer();
      } catch {
        ready = false;
      }
      await Bun.sleep(25);
    }
    if (!ready)
      throw new Error(`Proxy not ready: ${await docker(["logs", name])}`);
    const response = await fetch(`${origin}/events`, {
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(5_000)]),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/event-stream");
    if (!response.body) throw new Error("SSE body missing");
    const reader = response.body.getReader();
    cancelReader = () => reader.cancel();
    const decoder = new TextDecoder();
    let body = "";
    while (!body.includes('data: {"count":1}')) {
      const chunk = await reader.read();
      if (chunk.done) throw new Error("SSE ended before first event");
      body += decoder.decode(chunk.value, { stream: true });
    }
    expect(body).not.toContain('data: {"count":2}');
    const release = await fetch(`${origin}/release`, {
      method: "POST",
      signal: AbortSignal.timeout(3_000),
    });
    expect(await release.json()).toEqual({ released: true });
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      body += decoder.decode(chunk.value, { stream: true });
    }
    expect(body).toContain('data: {"count":2}');
    expect(body.match(/event: spike/g)).toHaveLength(2);
  } finally {
    controller.abort();
    try {
      await cancelReader?.();
    } finally {
      if (created) await docker(["rm", "--force", name]);
    }
  }
}, 15_000);
