export async function localServices() {
  const text = await Bun.file(
    new URL("../../.env.spike", import.meta.url),
  ).text();
  const values: Record<string, string> = {};
  for (const line of text.split("\n").filter(Boolean)) {
    const equal = line.indexOf("=");
    values[line.slice(0, equal)] = JSON.parse(line.slice(equal + 1));
  }
  for (const [key, expected] of Object.entries({
    SPIKE_MYSQL_HOST: "127.0.0.1",
    SPIKE_MYSQL_PORT: "3306",
    SPIKE_MYSQL_DATABASE: "dompis_db",
    SPIKE_REDIS_HOST: "127.0.0.1",
    SPIKE_REDIS_PORT: "6381",
  })) {
    if (values[key] !== expected)
      throw new Error(`Local spike allowlist rejected ${key}`);
  }
  if (!values.SPIKE_MYSQL_USER || !values.SPIKE_MYSQL_PASSWORD) {
    throw new Error("Local spike credentials missing");
  }
  return {
    mysql: {
      host: values.SPIKE_MYSQL_HOST,
      port: Number(values.SPIKE_MYSQL_PORT),
      database: values.SPIKE_MYSQL_DATABASE,
      user: values.SPIKE_MYSQL_USER,
      password: values.SPIKE_MYSQL_PASSWORD,
      connectTimeout: 5_000,
      connectionLimit: 1,
      timezone: "+07:00",
      dateStrings: true,
      supportBigNumbers: true,
      bigNumberStrings: true,
      decimalNumbers: false,
      multipleStatements: false,
    },
    redis: {
      host: values.SPIKE_REDIS_HOST,
      port: Number(values.SPIKE_REDIS_PORT),
      connectTimeout: 5_000,
      retryStrategy: () => null,
      maxRetriesPerRequest: null,
    },
  };
}
