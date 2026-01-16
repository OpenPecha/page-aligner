export const FONT_FAMILIES = [
  { value: 'monlam-3', label: 'Monlam Web', fontClass: "font-['monlam-3']" },
  { value: 'monlam-2', label: 'Monlam TBslim', fontClass: "font-['monlam-2']" },
  { value: 'noto-black', label: 'Noto Black', fontClass: "font-['noto-black']" },
  { value: 'noto-bold', label: 'Noto Bold', fontClass: "font-['noto-bold']" },
  { value: 'noto-medium', label: 'Noto Medium', fontClass: "font-['noto-medium']" },
  { value: 'noto-regular', label: 'Noto Regular', fontClass: "font-['noto-regular']" },
  { value: 'noto-semibold', label: 'Noto SemiBold', fontClass: "font-['noto-semibold']" },
  { value: 'monlam', label: 'Monlam OuChan', fontClass: "font-['monlam']" },
] as const

export const FONT_FAMILY_MAP = {
  'monlam-3': 'monlam-3',
  'monlam-2': 'monlam-2',
  'monlam': 'monlam',
  'noto-black': 'noto-black',
  'noto-bold': 'noto-bold',
  'noto-medium': 'noto-medium',
  'noto-regular': 'noto-regular',
  'noto-semibold': 'noto-semibold',
} as const

export const FONT_SIZES = [14, 16, 18, 20, 24, 28, 32] as const

export type FontFamily = keyof typeof FONT_FAMILY_MAP
export type FontSize = (typeof FONT_SIZES)[number]
