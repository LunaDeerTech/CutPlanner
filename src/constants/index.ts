// Application constants and configuration

export const APP_CONFIG = {
  name: 'CutPlanner',
  version: '0.1.0',
  description: '专业木板切割规划工具',
  author: 'LunaDeerTech'
} as const

export const MEASUREMENT_UNITS = {
  MM: 'mm',
  INCH: 'inch'
} as const

export const DEFAULT_VALUES = {
  KERF_WIDTH: 3, // 默认锯片厚度 (mm)
  MARGIN: 5, // 默认边距 (mm)
  MAX_MATERIAL_SIZE: 10000, // 最大材料尺寸 (mm)
  MIN_CUT_SIZE: 10 // 最小切割尺寸 (mm)
} as const

export const OPTIMIZATION_STRATEGIES = {
  FIRST_FIT: 'first-fit',
  BEST_FIT: 'best-fit',
  BOTTOM_LEFT: 'bottom-left',
  GENETIC: 'genetic'
} as const

export const MATERIAL_TYPES = [
  '实木板',
  '胶合板',
  'MDF板',
  '刨花板',
  'OSB板',
  '多层板',
  '免漆板',
  '生态板',
  '其他'
] as const

export const LOCAL_STORAGE_KEYS = {
  SETTINGS: 'cutplanner-settings',
  MATERIALS: 'cutplanner-materials',
  CUTTING_ITEMS: 'cutplanner-items',
  RECENT_PLANS: 'cutplanner-recent-plans'
} as const