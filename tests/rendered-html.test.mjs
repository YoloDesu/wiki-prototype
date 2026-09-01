import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the RelayBridge translation demo", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>RelayBridge — Live support, translated instantly<\/title>/i);
  assert.match(html, /RelayBridge/);
  assert.match(html, /AX-400 pressure alert/);
  assert.match(html, /Choose participant perspective/);
  assert.match(html, /Live translation/);
  assert.match(html, />JA</);
  assert.match(html, /Transcript/);
  assert.doesNotMatch(html, /Search conversations|Workspaces|TRANSLATION STREAM/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("ships the generated translation assets", async () => {
  await Promise.all([
    access(new URL("../public/media/ax400-control-panel.png", import.meta.url)),
    access(new URL("../public/og.png", import.meta.url)),
    access(new URL("../public/demo-files/AX-400_E17_Service_Bulletin_EN.pdf", import.meta.url)),
    access(new URL("../public/demo-files/AX-400_E17_Service_Bulletin_JA.pdf", import.meta.url)),
  ]);
});

test("keeps the finished product free of starter artifacts", async () => {
  const [page, layout, css, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /from "animejs"/);
  assert.match(page, /prefers-reduced-motion/);
  assert.match(layout, /\/og\.png/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(packageJson, /"animejs"/);
  assert.match(packageJson, /"lucide-react"/);
  assert.doesNotMatch(page, /_sites-preview|SkeletonPreview/);
  assert.doesNotMatch(layout, /Starter Project|codex-preview/);
  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
});
