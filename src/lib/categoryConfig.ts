export const CATEGORIES = ['살림', '데이트', '건강', '약속', '기타'] as const
export type Category = (typeof CATEGORIES)[number]

export const CATEGORY_CONFIG: Record<
  Category,
  { color: string; dot: string; activeBtn: string; idleBtn: string; chipStyle: string; hexColor: string }
> = {
  살림: {
    color: 'bg-orange-100 text-orange-700',
    dot: 'bg-orange-400',
    activeBtn: 'bg-orange-500 text-white border-orange-500',
    idleBtn: 'border-orange-200 text-orange-500 hover:bg-orange-50',
    chipStyle: 'bg-orange-50 text-orange-600 border-orange-200',
    hexColor: '#f97316',
  },
  데이트: {
    color: 'bg-pink-100 text-pink-700',
    dot: 'bg-pink-400',
    activeBtn: 'bg-pink-500 text-white border-pink-500',
    idleBtn: 'border-pink-200 text-pink-500 hover:bg-pink-50',
    chipStyle: 'bg-pink-50 text-pink-600 border-pink-200',
    hexColor: '#ec4899',
  },
  건강: {
    color: 'bg-green-100 text-green-700',
    dot: 'bg-green-400',
    activeBtn: 'bg-green-500 text-white border-green-500',
    idleBtn: 'border-green-200 text-green-500 hover:bg-green-50',
    chipStyle: 'bg-green-50 text-green-600 border-green-200',
    hexColor: '#22c55e',
  },
  약속: {
    color: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-400',
    activeBtn: 'bg-blue-500 text-white border-blue-500',
    idleBtn: 'border-blue-200 text-blue-500 hover:bg-blue-50',
    chipStyle: 'bg-blue-50 text-blue-600 border-blue-200',
    hexColor: '#3b82f6',
  },
  기타: {
    color: 'bg-gray-100 text-gray-600',
    dot: 'bg-gray-400',
    activeBtn: 'bg-gray-500 text-white border-gray-500',
    idleBtn: 'border-gray-200 text-gray-500 hover:bg-gray-50',
    chipStyle: 'bg-gray-50 text-gray-600 border-gray-200',
    hexColor: '#9ca3af',
  },
}
