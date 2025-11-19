export const valueClamp = (value: number, min: number = -Infinity, max: number = Infinity) => {
  return Math.min(Math.max(value, min), max)
}

