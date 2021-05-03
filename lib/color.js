/* eslint-disable no-param-reassign */
/* eslint-disable prefer-template */
/* eslint-disable id-length */

export function RGBtoHEX(r, g, b) {
  if (arguments.length === 1) {
    g = r.g;
    b = r.b;
    r = r.r;
  }
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function HEXToRGB(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

export function HSVtoRGB(h, s, v) {
  if (arguments.length === 1) {
    s = h.s;
    v = h.v;
    h = h.h;
  }
  const i = Math.floor(h * 6);
  const f = (h * 6) - i;
  const p = v * (1 - s);
  const q = v * (1 - (f * s));
  const t = v * (1 - ((1 - f) * s));
  let r;
  let g;
  let b;
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function RGBtoHSV(r, g, b) {
  if (arguments.length === 1) {
    g = r.g;
    b = r.b;
    r = r.r;
  }
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const s = (max === 0 ? 0 : d / max);
  const v = max / 255;

  let h;

  switch (max) {
    case min:
      h = 0;
      break;
    case r:
      h = (g - b) + d * (g < b ? 6 : 0);
      h /= 6 * d;
      break;
    case g:
      h = (b - r) + d * 2;
      h /= 6 * d;
      break;
    case b:
      h = (r - g) + d * 4;
      h /= 6 * d;
      break;
  }

  return { h, s, v };
}

export function RGBToHSL(r, g, b) {
  if (arguments.length === 1) {
    g = r.g;
    b = r.b;
    r = r.r;
  }

  // Make r, g, and b fractions of 1
  r /= 255;
  g /= 255;
  b /= 255;

  // Find greatest and smallest channel values
  const cmin = Math.min(r, g, b);
  const cmax = Math.max(r, g, b);
  const delta = cmax - cmin;
  let h = 0;
  let s = 0;
  let l = 0;

  // Calculate hue
  // No difference
  if (delta === 0) {
    h = 0;
  } else if (cmax === r) { // Red is max
    h = ((g - b) / delta) % 6;
  } else if (cmax === g) { // Green is max
    h = (b - r) / delta + 2;
  } else { // Blue is max
    h = (r - g) / delta + 4;
  }

  h = Math.round(h * 60);

  // Make negative hues positive behind 360°
  if (h < 0) {
    h += 360;
  }

  // Calculate lightness
  l = (cmax + cmin) / 2;

  // Calculate saturation
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  // Multiply l and s by 100
  s = Number((s * 100).toFixed(1));
  l = Number((l * 100).toFixed(1));

  return { h, s, l };

}

const isValidHex = (hex) => /^#([A-Fa-f0-9]{3,4}){1,2}$/.test(hex)

const getChunksFromString = (st, chunkSize) => st.match(new RegExp(`.{${chunkSize}}`, "g"))

const convertHexUnitTo256 = (hexStr) => parseInt(hexStr.repeat(2 / hexStr.length), 16)

const getAlphafloat = (a, alpha) => {
    if (typeof a !== "undefined") {return a / 256}
    if (typeof alpha !== "undefined"){
        if (1 < alpha && alpha <= 100) { return alpha / 100}
        if (0 <= alpha && alpha <= 1) { return alpha }
    }
    return 1
}

export const hexToRGBA = (hex, alpha) => {
    if (!isValidHex(hex)) {
        return hex;
      }
    const chunkSize = Math.floor((hex.length - 1) / 3)
    const hexArr = getChunksFromString(hex.slice(1), chunkSize)
    const [r, g, b, a] = hexArr.map(convertHexUnitTo256)
    return `rgba(${r}, ${g}, ${b}, ${getAlphafloat(a, alpha)})`
}