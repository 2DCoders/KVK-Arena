const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function setup() {
  const created = [];
  class FakeImage {
    complete = false;
    naturalWidth = 0;
    constructor() { created.push(this); }
    removeAttribute() { this.cancelled = true; }
    finish(success = true) {
      this.complete = true;
      this.naturalWidth = success ? 1280 : 0;
      (success ? this.onload : this.onerror)?.();
    }
  }
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync("src/lib/progressive-frames.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(code, { exports, Image: FakeImage });
  const images = [];
  const loader = exports.createFrameLoader(Array.from({ length: 100 }, (_, i) => String(i)), images, () => {});
  return { ...exports, created, images, loader };
}

test("first frame loads alone, then at most four requests run", () => {
  const { loader, created } = setup();
  loader.request(0);
  assert.equal(created.length, 1);
  created[0].finish();
  assert.equal(created.filter(image => !image.complete).length, 4);
  for (let i = 1; i < created.length; i++) created[i].finish();
  assert.equal(created.length, 9);
});

test("scroll jumps replace queued work and errors free download slots", () => {
  const { loader, created } = setup();
  loader.request(0);
  loader.request(80);
  created[0].finish(false);
  assert.equal(created[1].src, "80");
  assert.equal(created.filter(image => !image.complete).length, 4);
  created[1].finish(false);
  assert.equal(created.filter(image => !image.complete).length, 4);
  loader.stop();
  const count = created.length;
  created[2].finish();
  loader.request(20);
  assert.equal(created.length, count);
});

test("fallback selects nearest valid image and ignores failed frames", () => {
  const { nearestLoadedFrame } = setup();
  const images = [];
  images[0] = { complete: true, naturalWidth: 1280 };
  images[8] = { complete: true, naturalWidth: 1280 };
  images[9] = { complete: true, naturalWidth: 0 };
  assert.equal(nearestLoadedFrame(images, 9), 8);
  assert.equal(nearestLoadedFrame(images, 1), 0);
  assert.equal(nearestLoadedFrame([], 5), -1);
});
