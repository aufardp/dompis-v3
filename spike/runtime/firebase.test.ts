import { expect, test } from "bun:test";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { Agent, createServer } from "node:https";
import { connect, type ConnectionOptions } from "node:tls";
import { deleteApp, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

test("Firebase Admin 14.3.0 dry-run uses only the local mock transport", async () => {
  const cert = await readFile(
    new URL("../../.cache/spike-tls/cert.pem", import.meta.url),
  );
  const key = await readFile(
    new URL("../../.cache/spike-tls/key.pem", import.meta.url),
  );
  const captured: {
    path: string;
    method: string;
    body: unknown;
    authorization: string;
  }[] = [];
  const server = createServer({ cert, key }, async (request, response) => {
    const chunks: Buffer[] = [];
    for await (const chunk of request) chunks.push(Buffer.from(chunk));
    captured.push({
      path: request.url ?? "",
      method: request.method ?? "",
      body: JSON.parse(Buffer.concat(chunks).toString()),
      authorization: request.headers.authorization ?? "",
    });
    response.writeHead(200, {
      "content-type": "application/json",
      connection: "close",
    });
    response.end(
      JSON.stringify({ name: "projects/synthetic-spike/messages/mock" }),
    );
  });
  let connections = 0;
  let app: ReturnType<typeof initializeApp> | undefined;
  let agent: Agent | undefined;
  try {
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("Local TLS listener missing");
    const port = address.port;
    class LocalOnlyAgent extends Agent {
      override createConnection(options: ConnectionOptions) {
        if (options.host !== "fcm.googleapis.com")
          throw new Error("Unexpected Firebase destination blocked");
        connections += 1;
        return connect({
          host: "127.0.0.1",
          port,
          servername: "localhost",
          ca: cert,
          rejectUnauthorized: true,
        });
      }
    }
    agent = new LocalOnlyAgent({ keepAlive: false });
    app = initializeApp(
      {
        projectId: "synthetic-spike",
        credential: {
          getAccessToken: async () => ({
            access_token: "synthetic-local-only",
            expires_in: 3600,
          }),
        },
        httpAgent: agent,
      },
      `spike-${crypto.randomUUID()}`,
    );
    const messaging = getMessaging(app);
    expect(
      await messaging.send(
        { token: "synthetic-device", data: { count: "1" } },
        true,
      ),
    ).toBe("projects/synthetic-spike/messages/mock");
    expect(captured).toEqual([
      {
        path: "/v1/projects/synthetic-spike/messages:send",
        method: "POST",
        authorization: "Bearer synthetic-local-only",
        body: {
          message: { token: "synthetic-device", data: { count: "1" } },
          validate_only: true,
        },
      },
    ]);
    expect(connections).toBe(1);
    expect(() =>
      messaging.send(
        {
          token: "synthetic-device",
          data: { bad: 1 },
        } as unknown as Parameters<typeof messaging.send>[0],
        true,
      ),
    ).toThrow();
    expect(connections).toBe(1);
  } finally {
    if (app) await deleteApp(app);
    agent?.destroy();
    server.closeAllConnections();
    if (server.listening)
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
  }
}, 10_000);
