import { expect, test } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { Elysia, t } from "elysia";
import { XMLBuilder, XMLParser, XMLValidator } from "fast-xml-parser";
import sharp from "sharp";
import * as XLSX from "xlsx";

test("sharp 0.35.5 roundtrips synthetic pixels through PNG", async () => {
  const png = await sharp({
    create: {
      width: 2,
      height: 2,
      channels: 3,
      background: { r: 7, g: 11, b: 13 },
    },
  })
    .png()
    .toBuffer();
  const metadata = await sharp(png).metadata();
  expect(metadata).toMatchObject({ width: 2, height: 2, format: "png" });
  const { data, info } = await sharp(png)
    .raw()
    .toBuffer({ resolveWithObject: true });
  expect(info.channels).toBe(3);
  expect([...data]).toEqual(
    Array.from({ length: 4 }, () => [7, 11, 13]).flat(),
  );
  await expect(
    sharp(Buffer.from("synthetic-invalid-image")).metadata(),
  ).rejects.toThrow();
});

test("SheetJS 0.20.2 preserves synthetic cell types and Unicode", () => {
  expect(XLSX.version).toBe("0.20.2");
  const rows = [
    ["id", "text", "active"],
    [1, "001", true],
    [2, "Jakarta α", false],
  ];
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(rows), "spike");
  const buffer = XLSX.write(book, { type: "buffer", bookType: "xlsx" });
  const read = XLSX.read(buffer, { type: "buffer" });
  expect(
    XLSX.utils.sheet_to_json(read.Sheets.spike!, { header: 1, raw: true }),
  ).toEqual(rows);
  expect(read.Sheets.spike!.A2!.t).toBe("n");
  expect(read.Sheets.spike!.B2!.t).toBe("s");
  expect(read.Sheets.spike!.C2!.t).toBe("b");
});

test("XML parser 5.10.1 roundtrips synthetic fields without expanding entities", () => {
  const parser = new XMLParser({
    processEntities: false,
    parseTagValue: false,
  });
  const input = { root: { id: "001", title: "Jakarta α" } };
  const xml = new XMLBuilder({ processEntities: false }).build(input);
  expect(XMLValidator.validate(xml)).toBe(true);
  expect(parser.parse(xml)).toEqual(input);
  expect(XMLValidator.validate("<root><broken></root>")).not.toBe(true);
  expect(
    parser.parse(
      '<!DOCTYPE root [<!ENTITY local "synthetic">]><root>&local;</root>',
    ),
  ).toEqual({ root: "&local;" });
});

test("Eden 1.4.9 calls typed Elysia 1.4.30 in-process", async () => {
  const app = new Elysia().post("/spike", ({ body }) => body, {
    body: t.Object({ count: t.Number() }),
  });
  const client = treaty(app);
  const result = await client.spike.post({ count: 1 });
  const typed: { count: number } | null = result.data;
  expect(typed).toEqual({ count: 1 });
  expect(result.status).toBe(200);
  expect(result.error).toBeNull();
});
