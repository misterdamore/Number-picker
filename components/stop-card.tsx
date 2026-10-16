import { memo } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Stop } from '@/lib/numbers'

type PlayRowProps = {
  label: string
  number: string
  used: boolean
  variant?: 'exact' | 'any'
  onToggle: (number: string) => void
}

function PlayRow({ label, number, used, variant = 'exact', onToggle }: PlayRowProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={used}
      aria-label={`${label} ${number}`}
      onClick={() => onToggle(number)}
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary',
        used ? 'bg-success-bg' : 'hover:bg-border',
      )}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          'font-mono text-base font-bold tabular-nums',
          variant === 'any' ? 'text-any' : 'text-foreground',
        )}
      >
        {number}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'flex size-[18px] shrink-0 items-center justify-center rounded border-2',
          used ? 'border-success bg-success text-background' : 'border-muted-foreground',
        )}
      >
        {used && <Check className="size-3.5" strokeWidth={3.5} />}
      </span>
    </button>
  )
}

type StopCardProps = {
  stop: Stop
  usedExact1: boolean
  usedExact2: boolean
  usedAny: boolean
  onToggle: (number: string) => void
}

export const StopCard = memo(function StopCard({
  stop,
  usedExact1,
  usedExact2,
  usedAny,
  onToggle,
}: StopCardProps) {
  return (
    <li className="rounded-xl border bg-card p-3">
      <h2 className="mb-2 text-lg font-bold text-primary">Stop {stop.stop}</h2>
      <div className="flex flex-col gap-1">
        <PlayRow label="Exact 1:" number={stop.exact1} used={usedExact1} onToggle={onToggle} />
        <PlayRow label="Exact 2:" number={stop.exact2} used={usedExact2} onToggle={onToggle} />
        <PlayRow
          label="Any:"
          number={stop.any}
          used={usedAny}
          variant="any"
          onToggle={onToggle}
        />
      </div>
    </li>
  )
})
