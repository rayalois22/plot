import * as Plot from "@observablehq/plot";
import assert from "assert";

it("normalizeX normalizes as expected", () => {
  const data = [2, 10, 8];
  testNormalize(data, undefined, [1, 5, 4]);
  testNormalize(data, "first", [1, 5, 4]);
  testNormalize(data, "last", [0.25, 1.25, 1]);
  testNormalize(data, "mean", [0.3, 1.5, 1.2]);
  testNormalize(data, "sum", [0.1, 0.5, 0.4]);
});

it("normalizeX throws on non-numeric values", () => {
  const data = ["A", 10, 8];
  testNormalizeThrows(data);
  testNormalizeThrows(data, "first");
  testNormalizeThrows(data, "last");
  testNormalizeThrows(data, "mean");
  testNormalizeThrows(data, "sum");
});

function testNormalize(data, basis, r) {
  const mark = Plot.dot(data, Plot.normalizeX({x: data, basis}));
  const c = new Map(mark.initialize().channels);
  assert.deepStrictEqual(c.get("x").value, r);
}

function testNormalizeThrows(data, basis) {
  const mark = Plot.dot(data, Plot.normalizeX({x: data, basis}));
  assert.throws(() => mark.initialize());
}
