'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ClipboardList, Dices, FileSpreadsheet, ListChecks, RotateCcw, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DEFAULT_STOPS,
  MAX_STOPS,
  MIN_STOPS,
  type Stop,
  clampStops,
  generateStops,
  stopsToCsv,
  stopsToText,
  usedToText,
} from '@/lib/numbers'
import { StopCard } from '@/components/stop-card'

type Status = { message: string; isError: boolean } | null

export function NumbersGame() {
  const [stopInput, setStopInput] = useState(String(DEFAULT_STOPS))
  const [stops, setStops] = useState<Stop[]>([])
  const [used, setUsed] = useState<Set<string>>(() => new Set())
  const [status, setStatus] = useState<Status>(null)
  const statusTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  const showStatus = useCallback((message: string, isError = false) => {
    setStatus({ message, isError })
    clearTimeout(statusTimeout.current)
    statusTimeout.current = setTimeout(() => setStatus(null), 3000)
  }, [])

  const handleGenerate = useCallback(() => {
    const count = clampStops(Number.parseInt(stopInput, 10))
    setStopInput(String(count))
    setStops(generateStops(count))
    setUsed(new Set())
  }, [stopInput])

  // Random numbers are generated on the client only to avoid a hydration mismatch.
  useEffect(() => {
    setStops(generateStops(DEFAULT_STOPS))
    return () => clearTimeout(statusTimeout.current)
  }, [])

  const handleReset = () => {
    setUsed(new Set())
    showStatus('Reset complete!')
  }

  const toggleNumber = useCallback((number: string) => {
    setUsed((prev) => {
      const next = new Set(prev)
      if (next.has(number)) next.delete(number)
      else next.add(number)
      return next
    })
  }, [])

  const copy = async (text: string, successMsg: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showStatus(successMsg)
    } catch {
      showStatus('Failed to copy', true)
    }
  }

  const totalPlays = stops.length * 3
  const usedCount = used.size
  const progress = totalPlays === 0 ? 0 : (usedCount / totalPlays) * 100

  return (
    <div className="mx-auto max-w-[900px] rounded-[20px] bg-surface p-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] sm:p-8">
      <header className="mb-8 text-center">
        <h1 className="flex items-center justify-center gap-2 text-balance text-2xl font-bold text-primary sm:text-3xl">
          <Target className="size-7 shrink-0" aria-hidden="true" />
          Numbers Game - Track Used
        </h1>
        <p className="mt-2 text-muted-foreground">Click any number to mark as used</p>
      </header>

      <section aria-label="Controls" className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1 rounded-xl bg-card p-4">
          <label htmlFor="stopCount" className="mb-1.5 block text-sm text-muted-foreground">
            Number of Stops ({MIN_STOPS}–{MAX_STOPS})
          </label>
          <input
            id="stopCount"
            type="number"
            inputMode="numeric"
            min={MIN_STOPS}
            max={MAX_STOPS}
            value={stopInput}
            onChange={(e) => setStopInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' || e.nativeEvent.isComposing || e.keyCode === 229) return
              handleGenerate()
            }}
            className="w-full rounded-lg border-2 bg-input px-3 py-2 text-lg font-bold text-white focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <ActionButton onClick={handleGenerate} icon={<Dices />} className="bg-primary text-primary-foreground hover:bg-primary-hover">
            Generate New
          </ActionButton>
          <ActionButton onClick={handleReset} icon={<RotateCcw />} className="bg-danger text-foreground hover:bg-danger-hover">
            Reset Used
          </ActionButton>
        </div>
      </section>

      <section aria-label="Statistics">
        <dl className="mb-5 grid grid-cols-2 gap-4 rounded-xl bg-card p-4 sm:grid-cols-4">
          <Stat label="Stops" value={stops.length} />
          <Stat label="Total Plays" value={totalPlays} />
          <Stat label="Used" value={usedCount} />
          <Stat label="Remaining" value={totalPlays - usedCount} />
        </dl>

        <div className="rounded-lg bg-border p-2.5">
          <div
            role="progressbar"
            aria-label="Numbers used"
            aria-valuemin={0}
            aria-valuemax={totalPlays}
            aria-valuenow={usedCount}
            className="h-2 overflow-hidden rounded"
          >
            <div
              className="h-full rounded bg-gradient-to-r from-success-bg to-success transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </section>

      <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
        {stops.map((stop) => (
          <StopCard
            key={`${stop.stop}-${stop.exact1}`}
            stop={stop}
            usedExact1={used.has(stop.exact1)}
            usedExact2={used.has(stop.exact2)}
            usedAny={used.has(stop.any)}
            onToggle={toggleNumber}
          />
        ))}
      </ul>

      <section aria-label="Copy options" className="mt-6 text-center">
        <div className="flex flex-wrap justify-center gap-2.5">
          <CopyButton icon={<ClipboardList />} onClick={() => copy(stopsToText(stops), 'Copied to clipboard!')}>
            Copy Stops
          </CopyButton>
          <CopyButton icon={<FileSpreadsheet />} onClick={() => copy(stopsToCsv(stops), 'CSV copied!')}>
            Copy as CSV
          </CopyButton>
          <CopyButton icon={<ListChecks />} onClick={() => copy(usedToText(used), 'Used list copied!')}>
            Copy Used Only
          </CopyButton>
        </div>
        <p
          role="status"
          aria-live="polite"
          className={cn('mt-2.5 min-h-5 text-sm', status?.isError ? 'text-[#ff4a4a]' : 'text-success')}
        >
          {status?.message}
        </p>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col-reverse items-center text-center">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-3xl font-bold tabular-nums text-primary">{value}</dd>
    </div>
  )
}

type ButtonProps = {
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
  className?: string
}

function ActionButton({ onClick, icon, children, className }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-2 rounded-xl px-7 py-3 text-lg font-bold transition-[transform,background-color] duration-200 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&_svg]:size-5',
        className,
      )}
    >
      {icon}
      {children}
    </button>
  )
}

function CopyButton(props: Omit<ButtonProps, 'className'>) {
  return <ActionButton {...props} className="bg-info px-6 py-2.5 text-base text-white hover:bg-info-hover" />
}
