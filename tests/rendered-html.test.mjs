import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("keeps the RelayBridge demo focused on the translated conversation", async () => {
  const [page, layout, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /RelayBridge — Live support, translated instantly/);
  assert.match(page, /AX-400 pressure alert/);
  assert.match(page, /Choose participant perspective/);
  assert.match(page, /Live translation/);
  assert.match(page, /Transcript/);
  assert.match(page, /from "animejs"/);
  assert.match(page, /prefers-reduced-motion/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.doesNotMatch(page, /Search conversations|Workspaces|TRANSLATION STREAM/);
  assert.doesNotMatch(page, /_sites-preview|SkeletonPreview/);
  assert.doesNotMatch(layout, /Starter Project|codex-preview/);
});

test("ships the simulated translation assets", async () => {
  await Promise.all([
    access(new URL("../public/media/ax400-control-panel.png", import.meta.url)),
    access(new URL("../public/demo-files/AX-400_E17_Service_Bulletin_EN.pdf", import.meta.url)),
    access(new URL("../public/demo-files/AX-400_E17_Service_Bulletin_JA.pdf", import.meta.url)),
  ]);
});

test("includes a time-aligned bilingual support call", async () => {
  const [page, call, data, audioReadme] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/bilingual-call.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/call-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/audio/README.md", import.meta.url), "utf8"),
  ]);

  assert.match(page, /Join translated call/);
  assert.match(call, /Listening in/);
  assert.match(call, /English/);
  assert.match(call, /日本語/);
  assert.match(call, /EN \+ JA/);
  assert.match(call, /target\.currentTime = elapsedRef\.current/);
  assert.match(call, /buildBilingualCallScript/);
  assert.match(data, /ax400-support-call\.en\.mp3/);
  assert.match(data, /ax400-support-call\.ja\.mp3/);
  assert.match(data, /export const callDuration = 98/);
  assert.match(data, /EN: \$\{segment\.script\.en\}/);
  assert.match(data, /JA: \$\{segment\.script\.ja\}/);
  assert.match(audioReadme, /same call instant/);
});

test("keeps autoplay scrolling inside the conversation panel", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /chat\.scrollTo\(\{ top: chat\.scrollHeight, behavior \}\)/);
  assert.doesNotMatch(page, /scrollIntoView/);
  assert.match(css, /overscroll-behavior: contain/);
});

test("runs locally with npm start and contains no authentication layer", async () => {
  const [packageJson, readme] = await Promise.all([
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../README.md", import.meta.url), "utf8"),
  ]);

  const packageData = JSON.parse(packageJson);
  assert.equal(packageData.scripts.start, "next dev");
  assert.match(readme, /npm start/);
  assert.match(readme, /Não há backend, autenticação, conexão com ChatGPT/);
  await assert.rejects(access(new URL("../app/chatgpt-auth.ts", import.meta.url)));
  await assert.rejects(access(new URL("../.openai/hosting.json", import.meta.url)));
});
