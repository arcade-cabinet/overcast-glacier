export const randomRange = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

export const clamp = (val: number, min: number, max: number) => {
  return Math.min(Math.max(val, min), max);
};

export const lerp = (start: number, end: number, t: number) => {
  return start * (1 - t) + end * t;
};
