import { expect, test } from "bun:test";
import { z } from "zod";

test("oversized array fails before parsing its elements", () => {
  let visited = 0;
  const element = z.string().refine(() => ++visited > 0);
  const result = z.array(element).max(1).safeParse(["a", "b"]);
  expect(result.success).toBe(false);
  if (result.success) throw new Error("Expected bounded collection rejection");
  expect(result.error.issues).toMatchObject([{ code: "too_big" }]);
  expect(visited).toBe(0);
});

test("oversized set fails before parsing its elements", () => {
  let visited = 0;
  const element = z.string().refine(() => ++visited > 0);
  const result = z
    .set(element)
    .max(1)
    .safeParse(new Set(["a", "b"]));
  expect(result.success).toBe(false);
  if (result.success) throw new Error("Expected bounded collection rejection");
  expect(result.error.issues).toMatchObject([{ code: "too_big" }]);
  expect(visited).toBe(0);
});

test("oversized map fails before parsing its keys", () => {
  let visited = 0;
  const key = z.string().refine(() => ++visited > 0);
  const result = z
    .map(key, z.number())
    .max(1)
    .safeParse(
      new Map([
        ["a", 1],
        ["b", 2],
      ]),
    );
  expect(result.success).toBe(false);
  if (result.success) throw new Error("Expected bounded collection rejection");
  expect(result.error.issues).toMatchObject([{ code: "too_big" }]);
  expect(visited).toBe(0);
});

test("bounded valid collections retain their values", () => {
  expect(z.array(z.string()).max(1).parse(["a"])).toEqual(["a"]);
  expect(
    z
      .set(z.string())
      .max(1)
      .parse(new Set(["a"])),
  ).toEqual(new Set(["a"]));
  expect(
    z
      .map(z.string(), z.number())
      .max(1)
      .parse(new Map([["a", 1]])),
  ).toEqual(new Map([["a", 1]]));
});
