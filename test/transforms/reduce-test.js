import * as Plot from "@observablehq/plot";
import assert from "assert";

it("baked-in reducers reduce as expected", () => {
  const data = [0, 1, 2, 4, 5, 9];
  testReducer(data, "deviation", Math.sqrt(10.7));
  testReducer(data, "max", 9);
  testReducer(data, "mean", 3.5);
  testReducer(data, "median", 3);
  testReducer(data, "min", 0);
  testReducer(data, "sum", 21);
  testReducer(data, "variance", 10.7);
  testReducer(data, "mode", 0);
});

it("baked-in non-numeric reducers throw on non-numeric data", () => {
  const data = ["A", "B", "C", "B"];
  testReducer(data, "min", "A");
  testReducer(data, "max", "C");
  testReducer(data, "mode", "B");
});

it("function reducers reduce as expected", () => {
  const data = [0, 1, 2, 4, 5, 9];
  testReducer(data, v => v.length, 6);
  testReducer(data, v => v.join(", "), "0, 1, 2, 4, 5, 9");
});

it("baked-in numeric reducers throw on non-numeric data", () => {
  const data = ["A", "B", "C", "A"];
  testReducerThrows(data, "deviation");
  testReducerThrows(data, "mean");
  testReducerThrows(data, "median");
  testReducerThrows(data, "sum");
  testReducerThrows(data, "variance");
});

function testReducer(data, x, r) {
  const mark = Plot.dot(data, Plot.groupZ({x}, {x: d => d}));
  const c = new Map(mark.initialize().channels);
  assert.deepStrictEqual(c.get("x").value, [r]);
}

function testReducerThrows(data, x) {
  const mark = Plot.dot(data, Plot.groupZ({x}, {x: d => d}));
  assert.throws(() => mark.initialize());
}
