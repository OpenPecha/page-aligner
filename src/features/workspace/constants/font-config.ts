export const FONT_FAMILIES = [
  { value: 'monlam-3', label: 'Monlam Web', fontClass: "font-['monlam-3']" },
  { value: 'monlam-2', label: 'Monlam TBslim', fontClass: "font-['monlam-2']" },
  { value: 'noto-black', label: 'Noto Black', fontClass: "font-['noto-black']" },
  { value: 'noto-bold', label: 'Noto Bold', fontClass: "font-['noto-bold']" },
  { value: 'noto-medium', label: 'Noto Medium', fontClass: "font-['noto-medium']" },
  { value: 'noto-regular', label: 'Noto Regular', fontClass: "font-['noto-regular']" },
  { value: 'noto-semibold', label: 'Noto SemiBold', fontClass: "font-['noto-semibold']" },
  { value: 'monlam', label: 'Monlam OuChan', fontClass: "font-['monlam']" },
  { value: 'khampa-bechu', label: 'Khampa Bechu', fontClass: "font-['khampa-bechu']" },
  { value: 'khampa-chuyig', label: 'Khampa Chuyig', fontClass: "font-['khampa-chuyig']" },
  { value: 'khampa-drugang', label: 'Khampa Drugang', fontClass: "font-['khampa-drugang']" },
  { value: 'khampa-drutsa', label: 'Khampa Drutsa', fontClass: "font-['khampa-drutsa']" },
  { value: 'riwoche-yigchen', label: 'Riwoche Yigchen', fontClass: "font-['riwoche-yigchen']" },
  { value: 'riwoche-yigchung', label: 'Riwoche Yigchung', fontClass: "font-['riwoche-yigchung']" },
]

export const FONT_FAMILY_MAP = {
  'monlam-3': 'monlam-3',
  'monlam-2': 'monlam-2',
  'monlam': 'monlam',
  'noto-black': 'noto-black',
  'noto-bold': 'noto-bold',
  'noto-medium': 'noto-medium',
  'noto-regular': 'noto-regular',
  'noto-semibold': 'noto-semibold',
  'khampa-bechu': 'khampa-bechu',
  'khampa-chuyig': 'khampa-chuyig',
  'khampa-drugang': 'khampa-drugang',
  'khampa-drutsa': 'khampa-drutsa',
  'riwoche-yigchen': 'riwoche-yigchen',
  'riwoche-yigchung': 'riwoche-yigchung',
} as const

export const FONT_SIZES = [14, 16, 18, 20, 24, 28, 32] as const

export type FontFamily = keyof typeof FONT_FAMILY_MAP
export type FontSize = (typeof FONT_SIZES)[number]
