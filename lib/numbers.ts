export type Stop = {
  stop: number
  exact1: string
  exact2: string
  any: string
}

export const MIN_STOPS = 1
export const MAX_STOPS = 100
export const DEFAULT_STOPS = 40

const masterPool = Array.from({ length: 1000 }, (_, i) => String(i).padStart(3, '0'))

function shuffle<T>(array: readonly T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function clampStops(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_STOPS
  return Math.min(MAX_STOPS, Math.max(MIN_STOPS, Math.floor(value)))
}

export function generateStops(stopCount: number): Stop[] {
  const exactCount = stopCount * 2
  const anyCount = stopCount
  const exact: string[] = []
  const any: string[] = []

  for (const num of shuffle(masterPool)) {
    if (exact.length < exactCount) {
      exact.push(num)
    } else if (any.length < anyCount && new Set(num).size === 3) {
      any.push(num)
    }
    if (exact.length === exactCount && any.length === anyCount) break
  }

  return Array.from({ length: stopCount }, (_, i) => ({
    stop: i + 1,
    exact1: exact[i * 2],
    exact2: exact[i * 2 + 1],
    any: any[i],
  }))
}

export function stopsToText(stops: Stop[]): string {
  let text = `NUMBERS GAME - ${stops.length} Stops\n${'═'.repeat(40)}\n\n`
  for (const s of stops) {
    text += `Stop ${s.stop}:\n  Exact 1: ${s.exact1}\n  Exact 2: ${s.exact2}\n  Any:     ${s.any}\n\n`
  }
  return text.trim()
}

export function stopsToCsv(stops: Stop[]): string {
  return (
    'Stop,Exact1,Exact2,Any\n' +
    stops.map((s) => `${s.stop},${s.exact1},${s.exact2},${s.any}`).join('\n')
  )
}

export function usedToText(used: Set<string>): string {
  const sorted = [...used].sort()
  return `USED NUMBERS (${used.size}):\n${'═'.repeat(40)}\n\n${sorted.join('\n')}`
}
