interface ProgressBarProps {
  percentage: number
  label: string
  color: string
  completed?: number
  total?: number
  size?: 'sm' | 'md' | 'lg'
}

export default function ProgressBar({
  percentage,
  label,
  color,
  completed,
  total,
  size = 'md',
}: ProgressBarProps) {
  const trackHeight = size === 'lg' ? 'h-3' : size === 'sm' ? 'h-1.5' : 'h-2'
  const textSize = size === 'lg' ? 'text-sm' : 'text-xs'

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className={`${textSize} font-medium text-gray-600`}>{label}</span>
        <div className="flex items-center gap-1.5">
          {total !== undefined && (
            <span className={`${textSize} text-gray-400`}>
              {completed}/{total}
            </span>
          )}
          <span className={`${textSize} font-semibold`} style={{ color }}>
            {percentage}%
          </span>
        </div>
      </div>
      <div className={`w-full ${trackHeight} bg-gray-100 rounded-full overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
