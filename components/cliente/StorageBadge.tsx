interface StorageBadgeProps {
  dias: number
  cor: 'green' | 'yellow' | 'orange' | 'red'
}

const styles = {
  green: { bg: '#F0FDF4', color: '#16A34A', dot: '#22C55E' },
  yellow: { bg: '#FEFCE8', color: '#A16207', dot: '#EAB308' },
  orange: { bg: '#FFF7ED', color: '#C2410C', dot: '#F97316' },
  red: { bg: '#FEF2F2', color: '#B91C1C', dot: '#EF4444' },
}

export function StorageBadge({ dias, cor }: StorageBadgeProps) {
  const s = styles[cor]
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: s.bg, color: s.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {dias}d
    </span>
  )
}
