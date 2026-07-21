// Curated display fonts (loaded via Google Fonts in index.html) + safe system fallbacks.
export const FONTS = [
  'Archivo Black',
  'Anton',
  'Bangers',
  'Bebas Neue',
  'Inter',
  'Luckiest Guy',
  'Montserrat',
  'Oswald',
  'Poppins',
  'Rubik',
  'Russo One',
  'Titan One',
  'Impact',
  'Arial Black',
  'Georgia',
] as const

export const fontStack = (f: string) => `'${f}', sans-serif`
