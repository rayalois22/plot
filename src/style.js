import {string, number, maybeColor, maybeNumber, maybeValue, title, titleGroup} from "./mark.js";
import {filter} from "./defined.js";
import {max, min, mean, median, mode, sum, InternSet} from "d3";
import {map} from "./transforms/map.js";

export const offset = typeof window !== "undefined" && window.devicePixelRatio > 1 ? 0 : 0.5;

export function styles(
  mark,
  {
    title,
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    strokeOpacity,
    strokeLinejoin,
    strokeLinecap,
    strokeMiterlimit,
    strokeDasharray,
    mixBlendMode,
    shapeRendering
  },
  channels,
  {
    fill: defaultFill = "currentColor",
    stroke: defaultStroke = "none",
    strokeWidth: defaultStrokeWidth,
    strokeMiterlimit: defaultStrokeMiterlimit
  }
) {

  // Some marks don’t support fill (e.g., tick and rule).
  if (defaultFill === null) {
    fill = null;
    fillOpacity = null;
  }

  // Some marks default to fill with no stroke, while others default to stroke
  // with no fill. For example, bar and area default to fill, while dot and line
  // default to stroke. For marks that fill by default, the default fill only
  // applies if the stroke is (constant) none; if you set a stroke, then the
  // default fill becomes none. Similarly for marks that stroke by stroke, the
  // default stroke only applies if the fill is (constant) none.
  if (none(defaultFill)) {
    if (!none(defaultStroke) && !none(fill)) defaultStroke = "none";
  } else {
    if (none(defaultStroke) && !none(stroke)) defaultFill = "none";
  }

  const [vfill, cfill] = maybeColor(fill, defaultFill);
  const [vfillOpacity, cfillOpacity] = maybeNumber(fillOpacity);
  const [vstroke, cstroke] = maybeColor(stroke, defaultStroke);
  const [vstrokeOpacity, cstrokeOpacity] = maybeNumber(strokeOpacity);

  // For styles that have no effect if there is no stroke, only apply the
  // defaults if the stroke is not (constant) none.
  if (cstroke !== "none") {
    if (strokeWidth === undefined) strokeWidth = defaultStrokeWidth;
    if (strokeMiterlimit === undefined) strokeMiterlimit = defaultStrokeMiterlimit;
  }

  const [vstrokeWidth, cstrokeWidth] = maybeNumber(strokeWidth);

  // Some marks don’t support fill (e.g., tick and rule).
  if (defaultFill !== null) {
    mark.fill = impliedString(cfill, "currentColor");
    mark.fillOpacity = impliedNumber(cfillOpacity, 1);
  }

  mark.stroke = impliedString(cstroke, "none");
  mark.strokeWidth = impliedNumber(cstrokeWidth, 1);
  mark.strokeOpacity = impliedNumber(cstrokeOpacity, 1);
  mark.strokeLinejoin = impliedString(strokeLinejoin, "miter");
  mark.strokeLinecap = impliedString(strokeLinecap, "butt");
  mark.strokeMiterlimit = impliedNumber(strokeMiterlimit, 4);
  mark.strokeDasharray = string(strokeDasharray);
  mark.mixBlendMode = impliedString(mixBlendMode, "normal");
  mark.shapeRendering = impliedString(shapeRendering, "auto");

  return [
    ...channels,
    {name: "title", value: title, optional: true},
    {name: "fill", value: vfill, scale: "color", optional: true},
    {name: "fillOpacity", value: vfillOpacity, scale: "opacity", optional: true},
    {name: "stroke", value: vstroke, scale: "color", optional: true},
    {name: "strokeOpacity", value: vstrokeOpacity, scale: "opacity", optional: true},
    {name: "strokeWidth", value: vstrokeWidth, optional: true}
  ];
}

export function applyChannelStyles(selection, {title: L, fill: F, fillOpacity: FO, stroke: S, strokeOpacity: SO, strokeWidth: SW}) {
  applyAttr(selection, "fill", F && (i => F[i]));
  applyAttr(selection, "fill-opacity", FO && (i => FO[i]));
  applyAttr(selection, "stroke", S && (i => S[i]));
  applyAttr(selection, "stroke-opacity", SO && (i => SO[i]));
  applyAttr(selection, "stroke-width", SW && (i => SW[i]));
  title(L)(selection);
}

export function applyGroupedChannelStyles(selection, {title: L, fill: F, fillOpacity: FO, stroke: S, strokeOpacity: SO, strokeWidth: SW}) {
  applyAttr(selection, "fill", F && (([i]) => F[i]));
  applyAttr(selection, "fill-opacity", FO && (([i]) => FO[i]));
  applyAttr(selection, "stroke", S && (([i]) => S[i]));
  applyAttr(selection, "stroke-opacity", SO && (([i]) => SO[i]));
  applyAttr(selection, "stroke-width", SW && (([i]) => SW[i]));
  titleGroup(L)(selection);
}

export function applyIndirectStyles(selection, mark) {
  applyAttr(selection, "fill", mark.fill);
  applyAttr(selection, "fill-opacity", mark.fillOpacity);
  applyAttr(selection, "stroke", mark.stroke);
  applyAttr(selection, "stroke-width", mark.strokeWidth);
  applyAttr(selection, "stroke-opacity", mark.strokeOpacity);
  applyAttr(selection, "stroke-linejoin", mark.strokeLinejoin);
  applyAttr(selection, "stroke-linecap", mark.strokeLinecap);
  applyAttr(selection, "stroke-miterlimit", mark.strokeMiterlimit);
  applyAttr(selection, "stroke-dasharray", mark.strokeDasharray);
  applyAttr(selection, "shape-rendering", mark.shapeRendering);
}

export function applyDirectStyles(selection, mark) {
  applyStyle(selection, "mix-blend-mode", mark.mixBlendMode);
}

export function applyAttr(selection, name, value) {
  if (value != null) selection.attr(name, value);
}

export function applyStyle(selection, name, value) {
  if (value != null) selection.style(name, value);
}

export function applyTransform(selection, x, y, tx, ty) {
  tx = tx ? offset : 0;
  ty = ty ? offset : 0;
  if (x && x.bandwidth) tx += x.bandwidth() / 2;
  if (y && y.bandwidth) ty += y.bandwidth() / 2;
  if (tx || ty) selection.attr("transform", `translate(${tx},${ty})`);
}

export function impliedString(value, impliedValue) {
  if ((value = string(value)) !== impliedValue) return value;
}

export function impliedNumber(value, impliedValue) {
  if ((value = number(value)) !== impliedValue) return value;
}

export function filterStyles(index, {fill: F, fillOpacity: FO, stroke: S, strokeOpacity: SO, strokeWidth: SW}) {
  return filter(index, F, FO, S, SO, SW);
}

function none(color) {
  return color == null || color === "none";
}

export function maybeGroupedStyles(options = {}) {
  let {z} = options;
  if (z !== undefined) {
    const maps = [];
    for (const key of ["fill", "fillOpacity", "stroke", "strokeOpacity", "strokeWidth", "title"]) {
      if (options[key] != null) {
        let {value, reduce} = maybeValue(options[key]);
        options[key] = value;
        if (reduce) {
          reduce = maybeReduce(reduce);
          maps.push([key, d => (d[0] = reduce(d), d)]);
        }
      }
    }
    if (maps.length > 0) {
      options = map(Object.fromEntries(maps), options);
    }
  }
  return options;
}

function maybeReduce(reduce) {
  if (typeof reduce === "string") {
    switch (reduce.toLowerCase()) {
      case "first": return ([x]) => x;
      case "last": return x => x[x.length - 1];
      case "count": return x => x.length;
      case "distinct": return d => new InternSet(d).size;
      case "sum": return sum;
      // proportion
      // proportion-facet
      // deviation
      case "min": return min;
      case "max": return max;
      case "mean": return mean;
      case "median": return median;
      // variance
      case "mode": return mode;
    }
  }
  if (typeof reduce !== "function") throw new Error("invalid reduce");
  return reduce;
}
