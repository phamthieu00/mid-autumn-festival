/**
 * Tiny dependency-free Prometheus exposition. Counters/gauges keyed by a stable label string.
 * Good enough for a single small service; swap for prom-client if cardinality grows.
 */
type Labels = Record<string, string | number>

const labelKey = (labels: Labels) =>
  Object.keys(labels)
    .sort()
    .map((k) => `${k}="${String(labels[k]).replace(/"/g, '\\"')}"`)
    .join(',')

class Counter {
  private values = new Map<string, number>()
  constructor(
    readonly name: string,
    readonly help: string,
  ) {}
  inc(labels: Labels = {}, by = 1) {
    const k = labelKey(labels)
    this.values.set(k, (this.values.get(k) ?? 0) + by)
  }
  render(type: 'counter' | 'gauge' = 'counter') {
    const lines = [`# HELP ${this.name} ${this.help}`, `# TYPE ${this.name} ${type}`]
    for (const [k, v] of this.values) lines.push(`${this.name}${k ? `{${k}}` : ''} ${v}`)
    if (this.values.size === 0) lines.push(`${this.name} 0`)
    return lines.join('\n')
  }
}

class Gauge extends Counter {
  set(v: number, labels: Labels = {}) {
    this.inc(labels, v - this.get(labels))
  }
  get(labels: Labels = {}) {
    return (this as unknown as { values: Map<string, number> }).values.get(labelKey(labels)) ?? 0
  }
  render() {
    return super.render('gauge')
  }
}

const BUCKETS = [25, 50, 100, 250, 500, 1000, 2500, 5000]
class Histogram {
  private buckets = new Map<string, number[]>()
  private sums = new Map<string, { sum: number; count: number }>()
  constructor(
    readonly name: string,
    readonly help: string,
  ) {}
  observe(value: number, labels: Labels = {}) {
    const k = labelKey(labels)
    const b = this.buckets.get(k) ?? BUCKETS.map(() => 0)
    BUCKETS.forEach((le, i) => {
      if (value <= le) b[i]++
    })
    this.buckets.set(k, b)
    const s = this.sums.get(k) ?? { sum: 0, count: 0 }
    s.sum += value
    s.count++
    this.sums.set(k, s)
  }
  render() {
    const lines = [`# HELP ${this.name} ${this.help}`, `# TYPE ${this.name} histogram`]
    for (const [k, b] of this.buckets) {
      const s = this.sums.get(k)!
      const sep = k ? ',' : ''
      BUCKETS.forEach((le, i) => lines.push(`${this.name}_bucket{${k}${sep}le="${le}"} ${b[i]}`))
      lines.push(`${this.name}_bucket{${k}${sep}le="+Inf"} ${s.count}`)
      lines.push(`${this.name}_sum${k ? `{${k}}` : ''} ${s.sum}`)
      lines.push(`${this.name}_count${k ? `{${k}}` : ''} ${s.count}`)
    }
    return lines.join('\n')
  }
}

export const metrics = {
  httpRequests: new Counter('maf_http_requests_total', 'HTTP requests by method, route and status'),
  httpDuration: new Histogram(
    'maf_http_request_duration_ms',
    'HTTP request duration in ms by route',
  ),
  sessionsStarted: new Counter(
    'maf_game_sessions_started_total',
    'Game sessions started by game and mode',
  ),
  sessionsFinished: new Counter(
    'maf_game_sessions_finished_total',
    'Game sessions finished by game and result',
  ),
  wishesCreated: new Counter('maf_wishes_created_total', 'Wishes created by moderation status'),
  sseClients: new Gauge('maf_sse_clients', 'Open wish stream connections'),
  jobsRun: new Counter('maf_jobs_run_total', 'Background job runs by job'),
  rateLimited: new Counter(
    'maf_rate_limited_total',
    'Requests rejected by the rate limiter, by scope',
  ),
}

export function renderMetrics() {
  const up = `# HELP maf_process_uptime_seconds Process uptime\n# TYPE maf_process_uptime_seconds gauge\nmaf_process_uptime_seconds ${Math.round(process.uptime())}`
  return (
    [
      up,
      metrics.httpRequests.render(),
      metrics.httpDuration.render(),
      metrics.sessionsStarted.render(),
      metrics.sessionsFinished.render(),
      metrics.wishesCreated.render(),
      metrics.sseClients.render(),
      metrics.jobsRun.render(),
      metrics.rateLimited.render(),
    ].join('\n\n') + '\n'
  )
}
